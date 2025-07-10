// In backend/src/projects/projects.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from './schemas/project.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(
    projectData: any,
    images: Array<Express.Multer.File>,
  ): Promise<Project> {
    const imageUrls: string[] = [];
    if (images && images.length > 0) {
      for (const image of images) {
        const result = await this.cloudinaryService.uploadImage(image);
        imageUrls.push(result.secure_url);
      }
    }

    const newProjectData = {
      ...projectData,
      fundingGoal: Number(projectData.fundingGoal),
      avgHumidity: Number(projectData.avgHumidity),
      avgTemperature: Number(projectData.avgTemperature),
      imageUrls: imageUrls,
      imageUrl: imageUrls.length > 0 ? imageUrls[0] : projectData.imageUrl,
    };

    const newProject = new this.projectModel(newProjectData);
    return newProject.save();
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
}