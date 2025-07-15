import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
  constructor(private configService: ConfigService) {
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
    // Add walletAddress to the user object that gets attached to requests
    return { 
      userId: payload.sub, 
      email: payload.email, 
      roles: payload.roles, 
      walletAddress: payload.walletAddress 
    };
  }
}