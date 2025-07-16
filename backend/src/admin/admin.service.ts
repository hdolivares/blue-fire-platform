// In backend/src/admin/admin.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from '../projects/schemas/project.schema';
import { User } from '../users/schemas/user.schema';
import { Investment } from '../investments/schemas/investment.schema';
import { OperatorRequest } from '../operators/schemas/operator-request.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Investment.name) private investmentModel: Model<Investment>,
    @InjectModel(OperatorRequest.name) private operatorRequestModel: Model<OperatorRequest>,
  ) {}

  async getDashboardStats() {
    const totalInvestors = await this.userModel.countDocuments({ roles: 'Investor' }).exec();
    const projectsSeekingFunding = await this.projectModel.countDocuments({ status: 'SEEKING_FUNDING' }).exec();
    const operationalUnits = await this.projectModel.countDocuments({ status: 'OPERATIONAL' }).exec();
    const pendingOperatorRequests = await this.operatorRequestModel.countDocuments({ status: 'PENDING' }).exec();
    
    const totalCapitalResult = await this.projectModel.aggregate([
      { $group: { _id: null, total: { $sum: '$currentFunding' } } }
    ]).exec();
    
    const totalCapitalRaised = totalCapitalResult[0]?.total || 0;

    return {
      totalInvestors,
      projectsSeekingFunding,
      operationalUnits,
      totalCapitalRaised,
      pendingOperatorRequests,
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

  async getAllActiveInvestors() {
    const investors = await this.userModel
      .find({ roles: 'Investor' })
      .select('firstName lastName email walletAddress country createdAt')
      .sort({ createdAt: -1 })
      .exec();

    return investors;
  }

  async getAllInvestments() {
    const investments = await this.investmentModel
      .find()
      .populate('user', 'firstName lastName email walletAddress')
      .populate('project', 'projectName location status fundingGoal currentFunding')
      .sort({ createdAt: -1 })
      .exec();

    return investments;
  }

  async getInvestorInvestments(investorId: string) {
    const investments = await this.investmentModel
      .find({ user: investorId })
      .populate('project', 'projectName location status fundingGoal currentFunding')
      .sort({ createdAt: -1 })
      .exec();

    return investments;
  }

  async getInvestorStats() {
    const totalInvestors = await this.userModel.countDocuments({ roles: 'Investor' }).exec();
    const totalInvestments = await this.investmentModel.countDocuments().exec();
    
    const totalInvestmentAmount = await this.investmentModel.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).exec();

    const averageInvestmentPerInvestor = totalInvestors > 0 
      ? (totalInvestmentAmount[0]?.total || 0) / totalInvestors 
      : 0;

    return {
      totalInvestors,
      totalInvestments,
      totalInvestmentAmount: totalInvestmentAmount[0]?.total || 0,
      averageInvestmentPerInvestor,
    };
  }

  async getPendingOperatorRequests() {
    return this.operatorRequestModel
      .find({ status: 'PENDING' })
      .populate('operator', 'firstName lastName email')
      .populate('project', 'projectName status location')
      .sort({ createdAt: -1 })
      .exec();
  }
}