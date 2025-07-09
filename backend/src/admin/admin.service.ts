// In backend/src/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from '../projects/schemas/project.schema';
import { Investor } from '../users/schemas/user.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Investor.name) private investorModel: Model<Investor>,
  ) {}

  async getDashboardStats() {
    const totalInvestors = await this.investorModel.countDocuments().exec();
    const projectsSeekingFunding = await this.projectModel.countDocuments({ status: 'SEEKING_FUNDING' }).exec();
    const operationalUnits = await this.projectModel.countDocuments({ status: 'OPERATIONAL' }).exec();

    // Use an aggregation pipeline to sum the funding
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