import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

/**
 * @class JwtStrategy
 * @description This class is a Passport strategy for validating JSON Web Tokens (JWTs).
 * It extracts the token from the request header and verifies it using the secret key.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * @constructor
   * @param {ConfigService} configService - Service for accessing configuration (environment variables).
   */
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    // Get the JWT secret from environment variables.
    const secret = configService.get<string>('JWT_SECRET');

    // If the secret is not found, throw an error to prevent the app from running in an insecure state.
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }

    // Configure the JWT strategy.
    super({
      // Specifies that the token should be extracted from the 'Authorization: Bearer <token>' header.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Ensures that the token has not expired.
      ignoreExpiration: false,
      // The secret key used to sign and verify the token.
      secretOrKey: secret,
      // Pin the algorithm to prevent algorithm-confusion attacks.
      algorithms: ['HS256'],
    });
  }

  /**
   * @method validate
   * @description This method is called by Passport after it successfully verifies the token's signature.
   * The returned value is attached to the request object as `req.user`.
   * @param {any} payload - The decoded payload of the JWT.
   * @returns {object} The user object to be attached to the request.
   */
  async validate(payload: any) {
    // Validate that the user still exists in the database
    const user = await this.usersService.findOneByEmail(payload.email);
    
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    // Return user object that will be attached to the request
    return {
      userId: user._id,
      email: user.email,
      roles: user.roles,
      walletAddress: user.walletAddress,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}