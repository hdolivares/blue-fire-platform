// In backend/src/projects/projects.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from './schemas/project.schema';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private projectModel: Model<Project>) {}

  async findOneByName(projectName: string): Promise<Project | null> {
    return this.projectModel.findOne({ projectName: projectName }).exec();
  }

  async create(projectData: { projectName: string; fundingGoal: number }): Promise<Project> {
    const newProject = new this.projectModel(projectData);
    return newProject.save();
  }

  async findAll(): Promise<Project[]> {
    return this.projectModel.find().exec();
  }
}