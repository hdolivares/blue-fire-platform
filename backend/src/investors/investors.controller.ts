import { Controller, Get, Request } from '@nestjs/common';
import { InvestorsService } from './investors.service';
import { InvestorOnly } from '../common/decorators/auth.decorator';

@Controller('investors')
@InvestorOnly()
export class InvestorsController {
  constructor(private readonly investorsService: InvestorsService) {}

  /**
   * @description A protected endpoint to get the logged-in investor's portfolio.
   */
  @Get('my-portfolio')
  getMyPortfolio(@Request() req) {
    return this.investorsService.getMyPortfolio(req.user.userId);
  }

  /**
   * @description A protected endpoint to get the logged-in investor's portfolio summary.
   */
  @Get('portfolio-summary')
  getPortfolioSummary(@Request() req) {
    return this.investorsService.getPortfolioSummary(req.user.userId);
  }
}