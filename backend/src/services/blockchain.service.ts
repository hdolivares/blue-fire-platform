import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as path from 'path';
import * as fs from 'fs';

// Import RPC configuration
import { RPC_URL } from '../config/blockchain';

export interface BlockchainConfig {
  rpcUrl: string;
  factoryAddress: string;
  chainId: number;
}

export interface ProjectInfo {
  projectId: number;
  projectAddress: string;
  name: string;
  fundingCap: string;
  totalFunded: string;
  state: number; // 0=SEEKING_FUNDING, 1=FUNDED, 2=OPERATIONAL, 3=CLOSED
  beneficiary: string;
  alice: string;
}

export interface InvestorPosition {
  tokenId: number;
  owner: string;
  funded: string;
  pendingRewards: string;
}

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private factoryContract: ethers.Contract;
  private config: BlockchainConfig;

  constructor(private configService: ConfigService) {
    this.initializeConfig();
    this.setupProvider();
    this.setupContracts();
  }

  private initializeConfig() {
    this.config = {
      rpcUrl: this.configService.get<string>('BLOCKCHAIN_RPC_URL') || RPC_URL,
      factoryAddress: this.configService.get<string>('BLUE_FIRE_FACTORY_ADDRESS') || '0x9f715843A5bcF6d8afBa99FAed3d8F5634a3310b',
      chainId: this.configService.get<number>('BLOCKCHAIN_CHAIN_ID') || 31, // RSK testnet default
    };

    this.logger.log(`Blockchain config initialized:`);
    this.logger.log(`RPC URL: ${this.config.rpcUrl}`);
    this.logger.log(`Factory Address: ${this.config.factoryAddress}`);
    this.logger.log(`Chain ID: ${this.config.chainId}`);
  }

  private setupProvider() {
    try {
      this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
      this.logger.log('Blockchain provider initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize blockchain provider:', error);
      throw new Error(`Blockchain provider initialization failed: ${error.message}`);
    }
  }

  private setupContracts() {
    try {
      // Load Factory ABI
      const factoryAbiPath = path.join(process.cwd(), 'src', 'contracts', 'BlueFireFactory.json');
      if (!fs.existsSync(factoryAbiPath)) {
        throw new Error(`Factory ABI file not found at: ${factoryAbiPath}`);
      }
      const factoryAbi = JSON.parse(fs.readFileSync(factoryAbiPath, 'utf8'));

      // Initialize Factory Contract
      this.factoryContract = new ethers.Contract(
        this.config.factoryAddress,
        factoryAbi,
        this.provider
      );

      this.logger.log('Factory contract initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize contracts:', error);
      throw new Error(`Contract initialization failed: ${error.message}`);
    }
  }

  // === Factory Methods ===

  async getProjectCount(): Promise<number> {
    try {
      const count = await this.factoryContract.projectCount();
      return Number(count);
    } catch (error) {
      this.logger.error('Failed to get project count:', error);
      throw error;
    }
  }

  async getProjectAddress(projectId: number): Promise<string> {
    try {
      return await this.factoryContract.getProjectAddress(projectId);
    } catch (error) {
      this.logger.error(`Failed to get project address for ID ${projectId}:`, error);
      throw error;
    }
  }

  async getProjectInfo(projectId: number): Promise<ProjectInfo> {
    try {
      // Get project metadata from Factory contract
      const factoryProjectData = await this.factoryContract.getProject(projectId);
      
      // Get funding data from the specific project contract
      const projectContract = await this.getProjectContract(factoryProjectData.projectAddress);
      const totalFunded = await projectContract.totalFunded();

      return {
        projectId,
        projectAddress: factoryProjectData.projectAddress,
        name: factoryProjectData.name,
        fundingCap: ethers.formatEther(factoryProjectData.fundingCap),
        totalFunded: ethers.formatEther(totalFunded),
        state: Number(factoryProjectData.state),
        beneficiary: factoryProjectData.escrowBeneficiary,
        alice: factoryProjectData.aliceOperator,
      };
    } catch (error) {
      this.logger.error(`Failed to get project info for ID ${projectId}:`, error);
      throw error;
    }
  }

  // === Project Contract Methods ===

  private async getProjectContract(projectAddress: string): Promise<ethers.Contract> {
    const projectAbiPath = path.join(process.cwd(), 'src', 'contracts', 'UnitProjectERC721.json');
    if (!fs.existsSync(projectAbiPath)) {
      throw new Error(`Project ABI file not found at: ${projectAbiPath}`);
    }
    const projectAbi = JSON.parse(fs.readFileSync(projectAbiPath, 'utf8'));
    
    return new ethers.Contract(projectAddress, projectAbi, this.provider);
  }

  async getInvestorPosition(projectAddress: string, tokenId: number): Promise<InvestorPosition> {
    try {
      const projectContract = await this.getProjectContract(projectAddress);

      const [owner, funded, pendingRewards] = await Promise.all([
        projectContract.ownerOf(tokenId),
        projectContract.funded(tokenId),
        projectContract.pendingRewards(tokenId),
      ]);

      return {
        tokenId,
        owner,
        funded: ethers.formatEther(funded),
        pendingRewards: ethers.formatEther(pendingRewards),
      };
    } catch (error) {
      this.logger.error(`Failed to get investor position for token ${tokenId}:`, error);
      throw error;
    }
  }

  async getUserPositions(projectAddress: string, userAddress: string): Promise<InvestorPosition[]> {
    try {
      const projectContract = await this.getProjectContract(projectAddress);
      const balance = await projectContract.balanceOf(userAddress);
      
      const positions: InvestorPosition[] = [];
      for (let i = 0; i < Number(balance); i++) {
        const tokenId = await projectContract.tokenOfOwnerByIndex(userAddress, i);
        const position = await this.getInvestorPosition(projectAddress, Number(tokenId));
        positions.push(position);
      }

      return positions;
    } catch (error) {
      this.logger.error(`Failed to get user positions for ${userAddress}:`, error);
      throw error;
    }
  }

  // === Event Monitoring ===

  async getProjectEvents(projectId: number, fromBlock: number = 0) {
    try {
      const projectAddress = await this.getProjectAddress(projectId);
      const projectContract = await this.getProjectContract(projectAddress);

      const fundingFilter = projectContract.filters.FundingReceived();
      const revenueFilter = projectContract.filters.RevenueDeposited();
      const claimFilter = projectContract.filters.RewardsClaimed();

      const [fundingEvents, revenueEvents, claimEvents] = await Promise.all([
        projectContract.queryFilter(fundingFilter, fromBlock),
        projectContract.queryFilter(revenueFilter, fromBlock),
        projectContract.queryFilter(claimFilter, fromBlock),
      ]);

      return {
        funding: fundingEvents,
        revenue: revenueEvents,
        claims: claimEvents,
      };
    } catch (error) {
      this.logger.error(`Failed to get project events for ID ${projectId}:`, error);
      throw error;
    }
  }

  // === Connection Health ===

  async checkConnection(): Promise<boolean> {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      const network = await this.provider.getNetwork();
      
      this.logger.log(`Connected to blockchain:`);
      this.logger.log(`Block Number: ${blockNumber}`);
      this.logger.log(`Network: ${network.name} (${network.chainId})`);
      
      return true;
    } catch (error) {
      this.logger.error('Blockchain connection failed:', error);
      return false;
    }
  }

  async getFactoryInfo() {
    try {
      const admin = await this.factoryContract.admin();
      const projectCount = await this.getProjectCount();
      const implementation = await this.factoryContract.projectImplementation();
      
      return {
        factoryAddress: this.config.factoryAddress,
        admin,
        projectCount,
        implementation,
      };
    } catch (error) {
      this.logger.error('Failed to get factory info:', error);
      throw error;
    }
  }
} 