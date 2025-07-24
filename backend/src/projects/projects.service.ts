// In backend/src/projects/projects.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from './schemas/project.schema';
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
}