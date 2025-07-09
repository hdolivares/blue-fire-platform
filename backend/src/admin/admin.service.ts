// In backend/src/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from '../projects/schemas/project.schema';
import { User } from '../users/schemas/user.schema'; // <-- Change Investor to User here

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(User.name) private userModel: Model<User>, // <-- And here
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
}