// backend/src/investments/investments.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Investment } from './schemas/investment.schema';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InvestmentsService {
  constructor(
    @InjectModel(Investment.name) private investmentModel: Model<Investment>,
    private configService: ConfigService,
  ) {}

  async create(createInvestmentDto: { user: string, project: string, amount: number }): Promise<Investment> {
    const newInvestment = new this.investmentModel(createInvestmentDto);
    return newInvestment.save();
  }

  async getClaimableRewards(projectId: string, userWalletAddress: string): Promise<string> {
    try {
      const contractAddress = this.configService.get<string>('STAKING_VAULT_ADDRESS');
      const abiPath = path.join(process.cwd(), 'dist', 'contracts', 'StakingVault.json');
      
      if (!fs.existsSync(abiPath)) {
        throw new InternalServerErrorException(`ABI file not found at: ${abiPath}`);
      }
      const stakingVaultAbi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

      if (!contractAddress || !stakingVaultAbi) {
        throw new InternalServerErrorException('StakingVault address or ABI not configured.');
      }

      const rskTestnet = new ethers.Network("rsk-testnet", 31);
      const provider = new ethers.JsonRpcProvider('https://public-node.testnet.rsk.co', rskTestnet);
      const contract = new ethers.Contract(contractAddress, stakingVaultAbi, provider);

      const claimableAmount = await contract.getClaimableAmount(projectId, userWalletAddress);
      return ethers.formatEther(claimableAmount);
    } catch (error) {
      console.error("Failed to fetch claimable rewards:", error);
      return "0";
    }
  }
}