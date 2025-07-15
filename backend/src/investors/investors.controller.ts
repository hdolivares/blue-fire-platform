import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('investors')
export class InvestorsController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * @description A protected endpoint to get the logged-in investor's portfolio.
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-portfolio')
  getMyPortfolio(@Request() req) {
    return this.usersService.findMyPortfolio(req.user.userId);
  }
}