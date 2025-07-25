import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user.toObject();
      // Ensure all fields are included
      return {
        _id: result._id,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        roles: result.roles,
        walletAddress: result.walletAddress,
        country: result.country
      };
    }
    return null;
  }

  async resetPassword(token: string, newPass: string): Promise<{ message: string }> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.usersService.findUserByResetToken(hashedToken);
    
    if (!user) {
      throw new NotFoundException('Password reset token is invalid or has expired.');
    }

    user.password = await bcrypt.hash(newPass, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();

    return { message: 'Password has been reset successfully.' };
  }

async login(user: any) {
  console.log('Login - User object received:', {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    roles: user.roles,
    walletAddress: user.walletAddress
  });
  
  const payload = { 
    email: user.email, 
    sub: user._id, 
    roles: user.roles, 
    walletAddress: user.walletAddress,
    firstName: user.firstName,
    lastName: user.lastName
  };
  
  console.log('Login - JWT payload:', payload);
  
  return {
    access_token: this.jwtService.sign(payload),
    user: user,
  };
}

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findOneByEmail(email);

    // To prevent leaking info about which emails are registered,
    // we always return a generic success message.
    if (!user) {
      return { message: 'If an account with that email exists, a reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = await bcrypt.hash(resetToken, 10);
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    try {
      await user.save(); // Save the token to the user document
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);
      
      return { message: 'If an account with that email exists, a reset link has been sent.' };
    } catch (error) {
      // If sending email fails, clear the token from the database to be safe
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      
      console.error(error);
      throw new InternalServerErrorException('Failed to send password reset email.');
    }
  }
}