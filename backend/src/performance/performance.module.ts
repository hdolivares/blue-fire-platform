// In backend/src/performance/performance.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PerformanceData, PerformanceDataSchema } from './schemas/performance-data.schema';
import { PerformanceController } from './performance.controller';
import { PerformanceService } from './performance.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PerformanceData.name, schema: PerformanceDataSchema },
    ]),
  ],
  controllers: [PerformanceController],
  providers: [PerformanceService],
  exports: [MongooseModule],
})
export class PerformanceModule {}