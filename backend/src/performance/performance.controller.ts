// In backend/src/performance/performance.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Public()
  @Get(':projectId/historical')
  getHistoricalData(
    @Param('projectId') projectId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.performanceService.getHistoricalData(
      projectId,
      startDate,
      endDate,
    );
  }

  @Public()
  @Get(':projectId')
  getPerformanceByProjectId(@Param('projectId') projectId: string) {
    return this.performanceService.findByProjectId(projectId);
  }
}