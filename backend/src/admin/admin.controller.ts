// In backend/src/admin/admin.controller.ts
import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminOnly } from '../common/decorators/auth.decorator';
import { Roles } from '../common/decorators/roles.decorator';

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

  @Get('operator-requests')
  getPendingOperatorRequests() {
    return this.adminService.getPendingOperatorRequests();
  }

  // === NEW ANALYTICS ENDPOINTS ===

  @Get('analytics/global-map')
  getGlobalMapData() {
    return this.adminService.getGlobalMapData();
  }

  @Get('analytics/tvl')
  getTotalValueLocked() {
    return this.adminService.getTotalValueLocked();
  }

  @Get('analytics/revenue')
  getRevenueAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getRevenueAnalytics(startDate, endDate);
  }

  @Get('analytics/roi')
  getInvestorROIReports() {
    return this.adminService.getInvestorROIReports();
  }

  @Get('analytics/operational-health')
  @Roles('Admin')
  async getOperationalHealth() {
    return this.adminService.getOperationalHealthData();
  }

  @Get('analytics/export/:type')
  @Roles('Admin')
  async exportAnalyticsData(@Param('type') type: 'financial' | 'operational' | 'investor') {
    return this.adminService.exportAnalyticsData(type);
  }

  // === NEW EXTENDED ANALYTICS ENDPOINTS ===

  @Get('analytics/extended-metrics')
  @Roles('Admin')
  async getExtendedMetrics() {
    return this.adminService.getExtendedMetrics();
  }

  @Get('analytics/month-over-month')
  @Roles('Admin')
  async getMonthOverMonthData(@Query('months') months: string = '6') {
    return this.adminService.getMonthOverMonthData(parseInt(months));
  }

  @Get('analytics/industry-benchmarks')
  @Roles('Admin')
  async getIndustryBenchmarks() {
    return this.adminService.getIndustryBenchmarks();
  }

  @Get('analytics/vc-kpis')
  @Roles('Admin')
  async getVCKPIs() {
    return this.adminService.getVCKPIs();
  }
}