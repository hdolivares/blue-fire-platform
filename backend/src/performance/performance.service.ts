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

  async getHistoricalData(
    projectId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<PerformanceData[]> {
    const query: any = { project: projectId };

    // --- TEMPORARY DEBUGGING ---
    console.log(`\n--- DEBUG: Performance Data Request for project: ${projectId} ---`);
    const allProjectData = await this.performanceDataModel.find({ project: projectId }).exec();
    console.log(`Found a total of ${allProjectData.length} records for this project.`);
    if (allProjectData.length > 0) {
      console.log('Sample record timestamp:', allProjectData[0].timestamp);
    }
    // --- END TEMPORARY DEBUGGING ---

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        const startOfDay = new Date(startDate);
        startOfDay.setUTCHours(0, 0, 0, 0); // Ensure query starts at the beginning of the day in UTC
        query.timestamp.$gte = startOfDay;
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setUTCHours(23, 59, 59, 999); // Ensure the entire day is included
        query.timestamp.$lte = endOfDay;
      }
    }

    console.log('Executing query with date filter:', JSON.stringify(query, null, 2));

    const filteredResult = await this.performanceDataModel
      .find(query)
      .sort({ timestamp: 'asc' })
      .exec();
    
    console.log(`Query returned ${filteredResult.length} records after filtering.`);
    console.log('--- END DEBUG ---');

    return filteredResult;
  }
}