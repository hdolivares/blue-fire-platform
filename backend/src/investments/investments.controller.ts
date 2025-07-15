/**
 * @file investments.controller.ts
 * @description This controller handles incoming API requests for logging investments.
 */
import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InvestmentsService } from './investments.service';

@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  /**
   * Endpoint to log a new investment after a successful on-chain transaction.
   */
  @UseGuards(JwtAuthGuard)
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
   * @description Endpoint to get claimable rewards for a user and project.
   */
  @UseGuards(JwtAuthGuard)
  @Get(':projectId/claimable')
  getClaimableRewards(
    @Request() req,
    @Param('projectId') projectId: string,
  ) {
    // We need the user's wallet address, which we get from the user object
    const userWalletAddress = req.user.walletAddress; 
    return this.investmentsService.getClaimableRewards(projectId, userWalletAddress);
  }
}