// In backend/src/performance/performance.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Public()
  @Get(':projectId')
  getPerformanceByProjectId(@Param('projectId') projectId: string) {
    return this.performanceService.findByProjectId(projectId);
  }
}