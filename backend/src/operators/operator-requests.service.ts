import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OperatorRequest } from './schemas/operator-request.schema';
import { Project } from '../projects/schemas/project.schema';
import { User } from '../users/schemas/user.schema';
import { CreateOperatorRequestDto } from './dto/create-operator-request.dto';
import { ReviewOperatorRequestDto } from './dto/review-operator-request.dto';

@Injectable()
export class OperatorRequestsService {
  constructor(
    @InjectModel(OperatorRequest.name) private operatorRequestModel: Model<OperatorRequest>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createRequest(operatorId: string, createOperatorRequestDto: CreateOperatorRequestDto) {
    const { projectId } = createOperatorRequestDto;

    // Check if project exists
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if operator already has a pending request for this project
    const existingRequest = await this.operatorRequestModel.findOne({
      operator: operatorId,
      project: projectId,
    });

    if (existingRequest) {
      throw new ConflictException('You have already submitted a request for this project');
    }

    // Create the request
    const newRequest = new this.operatorRequestModel({
      operator: operatorId,
      project: projectId,
      status: 'PENDING',
    });

    return newRequest.save();
  }

  async getAllPendingRequests() {
    return this.operatorRequestModel
      .find({ status: 'PENDING' })
      .populate('operator', 'firstName lastName email')
      .populate('project', 'projectName status location')
      .sort({ createdAt: -1 })
      .exec();
  }

  async reviewRequest(requestId: string, adminId: string, reviewDto: ReviewOperatorRequestDto) {
    const { status, feedback } = reviewDto;

    const request = await this.operatorRequestModel
      .findById(requestId)
      .populate('operator')
      .populate('project');

    if (!request) {
      throw new NotFoundException('Operator request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Request has already been reviewed');
    }

    // Update the request
    request.status = status;
    request.adminFeedback = feedback;
    request.reviewedBy = adminId as any;
    request.reviewedAt = new Date();

    // If approved, assign the operator to the project
    if (status === 'APPROVED') {
      await this.projectModel.findByIdAndUpdate(
        (request.project as any)._id,
        { operator: (request.operator as any)._id }
      );
    }

    return request.save();
  }

  async getOperatorRequests(operatorId: string) {
    return this.operatorRequestModel
      .find({ operator: operatorId })
      .populate('project', 'projectName status location')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getRequestById(requestId: string) {
    const request = await this.operatorRequestModel
      .findById(requestId)
      .populate('operator', 'firstName lastName email')
      .populate('project', 'projectName status location')
      .populate('reviewedBy', 'firstName lastName')
      .exec();

    if (!request) {
      throw new NotFoundException('Operator request not found');
    }

    return request;
  }
} 