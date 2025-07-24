// In backend/src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Investment, InvestmentSchema } from '../investments/schemas/investment.schema';
import { PerformanceData, PerformanceDataSchema } from '../performance/schemas/performance-data.schema';
import { OperatorRequest, OperatorRequestSchema } from '../operators/schemas/operator-request.schema';
import { BlockchainService } from '../services/blockchain.service';
import { IoTService } from '../services/iot.service';
import { MarketService } from '../services/market.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: User.name, schema: UserSchema },
      { name: Investment.name, schema: InvestmentSchema },
      { name: PerformanceData.name, schema: PerformanceDataSchema },
      { name: OperatorRequest.name, schema: OperatorRequestSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, BlockchainService, IoTService, MarketService],
  exports: [AdminService],
})
export class AdminModule {}