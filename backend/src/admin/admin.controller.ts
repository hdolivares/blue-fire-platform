// In backend/src/admin/admin.controller.ts
import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminOnly } from '../common/decorators/auth.decorator';

@Controller('admin')
@AdminOnly()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('investors')
  getAllActiveInvestors() {
    return this.adminService.getAllActiveInvestors();
  }

  @Get('investments')
  getAllInvestments() {
    return this.adminService.getAllInvestments();
  }

  @Get('investors/:investorId/investments')
  getInvestorInvestments(@Param('investorId') investorId: string) {
    return this.adminService.getInvestorInvestments(investorId);
  }

  @Get('investor-stats')
  getInvestorStats() {
    return this.adminService.getInvestorStats();
  }

  // --- Adding new endpoint for operator---
  @Patch('projects/:projectId/assign-operator')
  assignOperator(
    @Param('projectId') projectId: string,
    @Body('operatorId') operatorId: string,
  ) {
    return this.adminService.assignOperatorToProject(projectId, operatorId);
  }
}