// In backend/src/performance/performance.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PerformanceData } from './schemas/performance-data.schema';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectModel(PerformanceData.name)
    private performanceDataModel: Model<PerformanceData>,
  ) {}

  async findByProjectId(projectId: string): Promise<PerformanceData[]> {
    return this.performanceDataModel.find({ project: projectId }).exec();
  }
}