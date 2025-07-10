// In backend/src/admin/admin.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from '../projects/schemas/project.schema';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getDashboardStats() {
    const totalInvestors = await this.userModel.countDocuments({ roles: 'Investor' }).exec();
    const projectsSeekingFunding = await this.projectModel.countDocuments({ status: 'SEEKING_FUNDING' }).exec();
    const operationalUnits = await this.projectModel.countDocuments({ status: 'OPERATIONAL' }).exec();
    
    const totalCapitalResult = await this.projectModel.aggregate([
      { $group: { _id: null, total: { $sum: '$currentFunding' } } }
    ]).exec();
    
    const totalCapitalRaised = totalCapitalResult[0]?.total || 0;

    return {
      totalInvestors,
      projectsSeekingFunding,
      operationalUnits,
      totalCapitalRaised,
    };
  }

    async assignOperatorToProject(projectId: string, operatorId: string): Promise<Project> {
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const operator = await this.userModel.findById(operatorId);
    if (!operator) {
      throw new NotFoundException('Operator user not found');
    }

    if (!operator.roles.includes('Operator')) {
      throw new BadRequestException('This user is not an Operator');
    }

    project.operator = operator;
    return project.save();
  }
}