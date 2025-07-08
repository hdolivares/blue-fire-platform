import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from './schemas/project.schema';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private projectModel: Model<Project>) {}

  async create(projectData: { 
    projectName: string; 
    fundingGoal: number;
    location: string;
    avgHumidity: number;
    avgTemperature: number;
  }): Promise<Project> {
    const newProject = new this.projectModel(projectData);
    return newProject.save();
  }

  async findAll(): Promise<Project[]> {
    return this.projectModel.find().exec();
  }
  
  async findOneByName(projectName: string): Promise<Project | null> {
    return this.projectModel.findOne({ projectName: projectName }).exec();
  }

  async findById(id: string): Promise<Project> {
    const project = await this.projectModel.findById(id).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
    return project;
  }
}