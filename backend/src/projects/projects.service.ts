// In backend/src/projects/projects.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectStatus } from './schemas/project.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { BlockchainService } from '../services/blockchain.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    private cloudinaryService: CloudinaryService,
    private blockchainService: BlockchainService,
  ) {}

  async create(
    projectData: any,
    images: Array<Express.Multer.File>,
  ): Promise<Project> {
    console.log('📝 Creating project with data:', projectData);

    // Handle image uploads
    const imageUrls: string[] = [];
    if (images && images.length > 0) {
      for (const image of images) {
        const result = await this.cloudinaryService.uploadImage(image);
        imageUrls.push(result.secure_url);
      }
    }

    // Prepare database project data
    const newProjectData = {
      ...projectData,
      fundingGoal: Number(projectData.fundingGoal || projectData.goalAmount),
      goalAmount: Number(projectData.goalAmount || projectData.fundingGoal),
      avgHumidity: Number(projectData.avgHumidity || 0),
      avgTemperature: Number(projectData.avgTemperature || 0),
      imageUrls: imageUrls,
      imageUrl: imageUrls.length > 0 ? imageUrls[0] : projectData.imageUrl,
      images: imageUrls,
      mainImage: imageUrls.length > 0 ? imageUrls[0] : projectData.mainImage,
      deployedOnChain: false, // Will be updated after blockchain deployment
    };

    // Create project in database first
    const newProject = new this.projectModel(newProjectData);
    const savedProject = await newProject.save();
    console.log('✅ Project saved to database with ID:', savedProject._id);

    // Deploy to blockchain if funding goals are provided
    if (projectData.deployToBlockchain !== false && (projectData.fundingCap || projectData.goalAmount)) {
      try {
        console.log('🚀 Deploying project to blockchain...');
        
        // TODO: We need to implement blockchain deployment in the blockchain service
        // For now, we'll simulate this - you'll need to implement this method
        // const blockchainResult = await this.blockchainService.createProject(
        //   savedProject.name || savedProject.projectName,
        //   savedProject.location,
        //   projectData.machineModel || 'AquaGen-3000',
        //   projectData.fundingCap || projectData.goalAmount,
        //   projectData.beneficiary || process.env.DEFAULT_ADMIN_ADDRESS
        // );

        // For now, simulate blockchain deployment
        console.log('⚠️ Blockchain deployment not yet implemented in backend service');
        console.log('💡 Use frontend admin interface for blockchain deployment');

        // Update with blockchain info (when implemented)
        // savedProject.blockchainProjectId = blockchainResult.projectId;
        // savedProject.blockchainAddress = blockchainResult.projectAddress;
        // savedProject.deployedOnChain = true;
        // await savedProject.save();

      } catch (error) {
        console.error('❌ Blockchain deployment failed:', error);
        console.log('💡 Project saved to database but not deployed to blockchain');
      }
    }

    return savedProject;
  }

  async findAll(): Promise<Project[]> {
    return this.projectModel.find().exec();
  }

  async findOneByName(projectName: string): Promise<Project | null> {
    return this.projectModel.findOne({ projectName: projectName }).exec();
  }

  async findById(id: string): Promise<Project> {
    // Add .populate('operator') to fetch the full user object
    const project = await this.projectModel.findById(id).populate('operator').exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
    return project;
  }

  async updateBlockchainInfo(
    projectId: string,
    blockchainProjectId: number,
    blockchainAddress: string,
  ): Promise<Project> {
    console.log(`🔗 Linking project ${projectId} to blockchain project ${blockchainProjectId}`);
    
    const project = await this.projectModel.findByIdAndUpdate(
      projectId,
      {
        blockchainProjectId,
        blockchainAddress,
        deployedOnChain: true,
      },
      { new: true }
    ).exec();

    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found`);
    }

    console.log('✅ Project linked to blockchain successfully');
    return project;
  }

  async findByBlockchainId(blockchainProjectId: number): Promise<Project | null> {
    return this.projectModel.findOne({ blockchainProjectId }).exec();
  }

  async getProjectsWithBlockchainInfo(): Promise<Project[]> {
    return this.projectModel
      .find()
      .populate('operator')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Sync a single project's data from blockchain to database
   */
  async syncProjectFromBlockchain(projectId: string): Promise<Project> {
    console.log(`🔄 Syncing project ${projectId} from blockchain...`);
    
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (!project.blockchainProjectId) {
      console.log('⚠️ Project has no blockchain ID, skipping sync');
      return project;
    }

    try {
      // Get current blockchain data
      const blockchainData = await this.blockchainService.getProjectInfo(project.blockchainProjectId);
      
      // Calculate current funding in USD (approximate)
      const currentFundingETH = parseFloat(blockchainData.totalFunded);
      const ethToUsdRate = 2000; // Should be fetched from API in production
      const currentFundingUSD = currentFundingETH * ethToUsdRate;
      
      // Determine project status based on blockchain state AND funding progress
      let newStatus = project.status;
      
      // Check if funding goal has been reached, regardless of blockchain state
      const fundingGoalMet = currentFundingUSD >= project.goalAmount;
      
      switch (blockchainData.state) {
        case 0: // SEEKING_FUNDING
          if (fundingGoalMet) {
            // Goal met but blockchain hasn't transitioned yet - move to funded
            newStatus = ProjectStatus.FUNDED_ORDER_PLACED;
            console.log(`📈 Project ${projectId}: Goal met (${currentFundingUSD} >= ${project.goalAmount}), updating status to FUNDED_ORDER_PLACED`);
          } else {
            newStatus = ProjectStatus.SEEKING_FUNDING;
          }
          break;
        case 1: // FUNDED
          newStatus = ProjectStatus.FUNDED_ORDER_PLACED;
          break;
        case 2: // OPERATIONAL
          newStatus = ProjectStatus.OPERATIONAL;
          break;
        case 3: // CLOSED
          newStatus = ProjectStatus.OPERATIONAL; // Keep as operational since no CLOSED in enum
          break;
        default:
          console.warn(`Unknown blockchain state: ${blockchainData.state}, keeping current status: ${project.status}`);
      }

      // Update project with blockchain data
      const updatedProject = await this.projectModel.findByIdAndUpdate(
        projectId,
        {
          $set: {
            // Update both current amount fields for compatibility
            currentAmount: currentFundingUSD,
            currentFunding: currentFundingUSD,
            currentFundingETH: currentFundingETH,
            status: newStatus,
            blockchainState: blockchainData.state,
            lastSyncAt: new Date(),
          }
        },
        { new: true }
      );

      if (!updatedProject) {
        throw new NotFoundException(`Project ${projectId} not found after update`);
      }

      console.log(`✅ Project ${projectId} synced successfully:`, {
        status: `${project.status} → ${newStatus}`,
        currentFundingETH,
        currentFundingUSD,
        blockchainState: blockchainData.state,
        fundingGoalMet: fundingGoalMet,
        goalAmount: project.goalAmount,
      });

      return updatedProject;
    } catch (error) {
      console.error(`❌ Failed to sync project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Sync multiple projects from blockchain to database
   */
  async syncAllProjectsFromBlockchain(): Promise<{ synced: number; errors: number }> {
    console.log('🔄 Syncing all projects from blockchain...');
    
    const projects = await this.projectModel.find({ 
      blockchainProjectId: { $exists: true, $ne: null },
      deployedOnChain: true 
    });

    let synced = 0;
    let errors = 0;

    for (const project of projects) {
      try {
        await this.syncProjectFromBlockchain(String(project._id));
        synced++;
      } catch (error) {
        console.error(`Failed to sync project ${String(project._id)}:`, error);
        errors++;
      }
    }

    console.log(`✅ Bulk sync completed: ${synced} synced, ${errors} errors`);
    return { synced, errors };
  }

  /**
   * Sync specific project after successful blockchain transaction
   */
  async syncProjectAfterTransaction(
    projectId: string, 
    transactionType: 'investment' | 'revenue' | 'state_change'
  ): Promise<Project> {
    console.log(`🔄 Post-transaction sync for project ${projectId} (${transactionType})`);
    
    // Wait a moment for blockchain to update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return this.syncProjectFromBlockchain(projectId);
  }

  /**
   * Find project by blockchain project ID for quick sync operations
   */
  async findByBlockchainProjectId(blockchainProjectId: number): Promise<Project | null> {
    return this.projectModel.findOne({ blockchainProjectId }).exec();
  }
}