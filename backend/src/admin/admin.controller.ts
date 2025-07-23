import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminOnly } from '../common/decorators/auth.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin')
@AdminOnly()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // === DASHBOARD ENDPOINTS ===
  @Get('dashboard')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // === INVESTOR ENDPOINTS ===
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

  // === OPERATOR ENDPOINTS ===
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

  // === ANALYTICS ENDPOINTS ===
  @Get('analytics/global-map')
  @Roles('Admin')
  async getGlobalMapData() {
    return this.adminService.getGlobalMapData();
  }

  @Get('analytics/tvl')
  @Roles('Admin')
  async getTotalValueLocked() {
    return this.adminService.getTotalValueLocked();
  }

  @Get('analytics/revenue')
  @Roles('Admin')
  async getRevenueAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getRevenueAnalytics(startDate, endDate);
  }

  @Get('analytics/roi-reports')
  @Roles('Admin')
  async getInvestorROIReports() {
    return this.adminService.getInvestorROIReports();
  }

  @Get('analytics/operational-health')
  @Roles('Admin')
  async getOperationalHealthData() {
    return this.adminService.getOperationalHealthData();
  }

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

  @Get('analytics/vc-kpis')
  @Roles('Admin')
  async getVCKPIs() {
    return this.adminService.getVCKPIs();
  }

  // === BLOCKCHAIN ENDPOINTS ===
  @Get('analytics/blockchain-metrics')
  async getBlockchainMetrics() {
    return this.adminService.blockchainService.getFactoryInfo();
  }

  @Get('analytics/blockchain-status')
  async getBlockchainStatus() {
    const isConnected = await this.adminService.blockchainService.checkConnection();
    const factoryInfo = await this.adminService.blockchainService.getFactoryInfo();
    
    return {
      isConnected,
      factoryInfo,
    };
  }

  // === IOT ENDPOINTS ===
  @Get('analytics/iot-metrics')
  async getIoTMetrics() {
    return this.adminService.iotService.getIoTMetrics();
  }

  // === MARKET ENDPOINTS ===
  @Get('analytics/market-data')
  async getMarketData() {
    return this.adminService.marketService.getMarketData();
  }

  @Get('analytics/competitor-analysis')
  async getCompetitorAnalysis() {
    return this.adminService.marketService.getCompetitorAnalysis();
  }

  @Get('analytics/industry-benchmarks')
  async getIndustryBenchmarks() {
    return this.adminService.marketService.getIndustryBenchmarks();
  }

  // === EXPORT ENDPOINTS ===
  @Get('analytics/export/:type')
  @Roles('Admin')
  async exportAnalyticsData(@Param('type') type: 'financial' | 'operational' | 'investor') {
    return this.adminService.exportAnalyticsData(type);
  }
}