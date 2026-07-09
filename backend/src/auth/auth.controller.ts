import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { RateLimit } from '../common/decorators/rate-limit.decorator';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from '../users/dto/register-user.dto';

const HOUR = 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  // 10 login attempts / 15 min / IP — enough for fat-fingering, hostile to
  // credential-stuffing.
  @Public()
  @RateLimit({ max: 10, windowMs: 15 * 60 * 1000 })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // 5 signups / hour / IP. Combined with the DTO honeypot, this throttles
  // automated account creation to a trickle.
  @Public()
  @RateLimit({ max: 5, windowMs: HOUR })
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.register(registerUserDto);
  }

  // New endpoint for forgot password
  @Public()
  @RateLimit({ max: 5, windowMs: HOUR })
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

    // New endpoint for resetting the password
  @Public()
  @RateLimit({ max: 10, windowMs: HOUR })
  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }
}