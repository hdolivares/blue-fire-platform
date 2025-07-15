import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Investment } from '../investments/schemas/investment.schema';

@Injectable()
export class InvestorsService {
  constructor(private readonly usersService: UsersService) {}

  async getMyPortfolio(userId: string): Promise<Investment[]> {
    return this.usersService.findMyPortfolio(userId);
  }

  async getPortfolioSummary(userId: string) {
    const portfolio = await this.getMyPortfolio(userId);
    
    const totalInvested = portfolio.reduce((sum, investment) => sum + investment.amount, 0);
    const totalProjects = portfolio.length;
    
    return {
      totalInvested,
      totalProjects,
      investments: portfolio,
    };
  }
} 