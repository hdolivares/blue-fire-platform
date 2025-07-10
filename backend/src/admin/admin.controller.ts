// In backend/src/admin/admin.controller.ts
import { Controller, Get, Patch, Param, Body } from '@nestjs/common'; // <-- Adding Patch and Param
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
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