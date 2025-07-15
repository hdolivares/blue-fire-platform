import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InvestorsService } from './investors.service';

@Controller('investors')
export class InvestorsController {
  constructor(private readonly investorsService: InvestorsService) {}

  /**
   * @description A protected endpoint to get the logged-in investor's portfolio.
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-portfolio')
  getMyPortfolio(@Request() req) {
    return this.investorsService.getMyPortfolio(req.user.userId);
  }

  /**
   * @description A protected endpoint to get the logged-in investor's portfolio summary.
   */
  @UseGuards(JwtAuthGuard)
  @Get('portfolio-summary')
  getPortfolioSummary(@Request() req) {
    return this.investorsService.getPortfolioSummary(req.user.userId);
  }
}