// In backend/src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ProjectsModule } from '../projects/projects.module';
import { InvestorsModule } from '../investors/investors.module';

@Module({
  imports: [ProjectsModule, InvestorsModule], // Import modules to access their models
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}