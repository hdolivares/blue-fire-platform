// In backend/src/performance/performance.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { PerformanceService } from './performance.service';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get(':projectId')
  getPerformanceByProjectId(@Param('projectId') projectId: string) {
    return this.performanceService.findByProjectId(projectId);
  }
}