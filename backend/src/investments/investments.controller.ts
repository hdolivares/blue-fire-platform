/**
 * @file investments.controller.ts
 * @description This controller handles incoming API requests for logging investments.
 */
import { Controller, Post, Body, Request, Get, Param } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { InvestorOnly } from '../common/decorators/auth.decorator';

@Controller('investments')
@InvestorOnly()
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  /**
   * Endpoint to log a new investment after a successful on-chain transaction.
   */
  @Post()
  logInvestment(
    @Request() req,
    @Body() body: { projectId: string; amount: number },
  ) {
    const userId = req.user.userId;
    return this.investmentsService.create({
      user: userId,
      project: body.projectId,
      amount: body.amount,
    });
  }

  /**
   * @description Endpoint to get all user positions for a project.
   */
  @Get(':projectId/positions')
  async getUserPositions(
    @Request() req,
    @Param('projectId') projectId: string,
  ) {
    const userWalletAddress = req.user.walletAddress;
    
    // Get project info first to get the project address
    const projectInfo = await this.investmentsService.getProjectInfo(Number(projectId));
    
    // Get user positions for this project
    return this.investmentsService.getUserPositions(projectInfo.projectAddress, userWalletAddress);
  }

  /**
   * @description Endpoint to get project information.
   */
  @Get(':projectId/info')
  getProjectInfo(@Param('projectId') projectId: string) {
    return this.investmentsService.getProjectInfo(Number(projectId));
  }

  /**
   * @description Endpoint to get claimable rewards for a specific position.
   */
  @Get(':projectId/claimable/:tokenId')
  async getClaimableRewards(
    @Request() req,
    @Param('projectId') projectId: string,
    @Param('tokenId') tokenId: string,
  ) {
    const userWalletAddress = req.user.walletAddress;
    
    // Get project info first to get the project address
    const projectInfo = await this.investmentsService.getProjectInfo(Number(projectId));
    
    return this.investmentsService.getClaimableRewards(
      projectInfo.projectAddress, 
      userWalletAddress, 
      Number(tokenId)
    );
  }
}