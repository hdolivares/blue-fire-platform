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

  async getClaimableRewards(projectAddress: string, userWalletAddress: string, tokenId: number): Promise<string> {
    try {
      // Load project contract ABI
      const abiPath = path.join(process.cwd(), 'src', 'contracts', 'UnitProjectERC721.json');
      
      if (!fs.existsSync(abiPath)) {
        throw new InternalServerErrorException(`Project ABI file not found at: ${abiPath}`);
      }
      const projectAbi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

      // Set up provider
      const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL') || 'http://localhost:8545';
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(projectAddress, projectAbi, provider);

      // Get pending rewards for specific token ID
      const pendingRewards = await contract.pendingRewards(tokenId);
      return ethers.formatEther(pendingRewards);
    } catch (error) {
      console.error("Failed to fetch claimable rewards:", error);
      return "0";
    }
  }

  async getUserPositions(projectAddress: string, userWalletAddress: string): Promise<any[]> {
    try {
      const abiPath = path.join(process.cwd(), 'src', 'contracts', 'UnitProjectERC721.json');
      
      if (!fs.existsSync(abiPath)) {
        throw new InternalServerErrorException(`Project ABI file not found at: ${abiPath}`);
      }
      const projectAbi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

      const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL') || 'http://localhost:8545';
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(projectAddress, projectAbi, provider);

      // Get user's NFT balance
      const balance = await contract.balanceOf(userWalletAddress);
      const positions: Array<{
        tokenId: number;
        funded: string;
        pendingRewards: string;
      }> = [];

      // Get each position
      for (let i = 0; i < Number(balance); i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(userWalletAddress, i);
        const funded = await contract.funded(tokenId);
        const pendingRewards = await contract.pendingRewards(tokenId);

        positions.push({
          tokenId: Number(tokenId),
          funded: ethers.formatEther(funded),
          pendingRewards: ethers.formatEther(pendingRewards),
        });
      }

      return positions;
    } catch (error) {
      console.error("Failed to fetch user positions:", error);
      return [];
    }
  }

  async getProjectInfo(projectId: number): Promise<any> {
    try {
      // Get factory contract
      const factoryAddress = this.configService.get<string>('BLUE_FIRE_FACTORY_ADDRESS') || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
      const factoryAbiPath = path.join(process.cwd(), 'src', 'contracts', 'BlueFireFactory.json');
      
      if (!fs.existsSync(factoryAbiPath)) {
        throw new InternalServerErrorException(`Factory ABI file not found at: ${factoryAbiPath}`);
      }
      const factoryAbi = JSON.parse(fs.readFileSync(factoryAbiPath, 'utf8'));

      const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL') || 'http://localhost:8545';
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const factoryContract = new ethers.Contract(factoryAddress, factoryAbi, provider);

      // Get project address
      const projectAddress = await factoryContract.getProjectAddress(projectId);

      // Get project contract
      const projectAbiPath = path.join(process.cwd(), 'src', 'contracts', 'UnitProjectERC721.json');
      const projectAbi = JSON.parse(fs.readFileSync(projectAbiPath, 'utf8'));
      const projectContract = new ethers.Contract(projectAddress, projectAbi, provider);

      // Get project data
      const [name, fundingCap, totalFunded, state] = await Promise.all([
        projectContract.name(),
        projectContract.fundingCap(),
        projectContract.totalFunded(),
        projectContract.state(),
      ]);

      return {
        projectId,
        projectAddress,
        name,
        fundingCap: ethers.formatEther(fundingCap),
        totalFunded: ethers.formatEther(totalFunded),
        state: Number(state),
        fundingProgress: (Number(totalFunded) / Number(fundingCap)) * 100,
      };
    } catch (error) {
      console.error("Failed to fetch project info:", error);
      throw error;
    }
  }
}