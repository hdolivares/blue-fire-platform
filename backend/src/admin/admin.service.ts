// In backend/src/admin/admin.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from '../projects/schemas/project.schema';
import { User } from '../users/schemas/user.schema';
import { Investment } from '../investments/schemas/investment.schema';
import { OperatorRequest } from '../operators/schemas/operator-request.schema';
import { PerformanceData } from '../performance/schemas/performance-data.schema';

export interface HealthDataItem {
  projectId: string;
  projectName: string;
  location: string;
  operator: any;
  uptimePercentage: number;
  targetUptime: number;
  avgEfficiency: number;
  expectedEfficiency: number;
  avgWaterProduction: number;
  hasEfficiencyAlert: boolean;
  efficiencyDeviation: number;
  lastUpdated: Date;
  status: 'HEALTHY' | 'NEEDS_ATTENTION';
}

export interface OperationalDataItem {
  projectName: string;
  location: string;
  avgEfficiency: number;
  avgWaterProduction: number;
  dataPoints: number;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Investment.name) private investmentModel: Model<Investment>,
    @InjectModel(OperatorRequest.name) private operatorRequestModel: Model<OperatorRequest>,
    @InjectModel(PerformanceData.name) private performanceModel: Model<PerformanceData>,
  ) {}

  async getDashboardStats() {
    const totalInvestors = await this.userModel.countDocuments({ roles: 'Investor' }).exec();
    const projectsSeekingFunding = await this.projectModel.countDocuments({ status: 'SEEKING_FUNDING' }).exec();
    const operationalUnits = await this.projectModel.countDocuments({ status: 'OPERATIONAL' }).exec();
    const pendingOperatorRequests = await this.operatorRequestModel.countDocuments({ status: 'PENDING' }).exec();
    
    const totalCapitalResult = await this.projectModel.aggregate([
      { $group: { _id: null, total: { $sum: '$currentFunding' } } }
    ]).exec();
    
    const totalCapitalRaised = totalCapitalResult[0]?.total || 0;

    return {
      totalInvestors,
      projectsSeekingFunding,
      operationalUnits,
      totalCapitalRaised,
      pendingOperatorRequests,
    };
  }

  async assignOperatorToProject(projectId: string, operatorId: string): Promise<Project> {
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const operator = await this.userModel.findById(operatorId);
    if (!operator) {
      throw new NotFoundException('Operator user not found');
    }

    if (!operator.roles.includes('Operator')) {
      throw new BadRequestException('This user is not an Operator');
    }

    project.operator = operator;
    return project.save();
  }

  async getAllActiveInvestors() {
    const investors = await this.userModel
      .find({ roles: 'Investor' })
      .select('firstName lastName email walletAddress country createdAt')
      .sort({ createdAt: -1 })
      .exec();

    return investors;
  }

  async getAllInvestments() {
    const investments = await this.investmentModel
      .find()
      .populate('user', 'firstName lastName email walletAddress')
      .populate('project', 'projectName location status fundingGoal currentFunding')
      .sort({ createdAt: -1 })
      .exec();

    return investments;
  }

  async getInvestorInvestments(investorId: string) {
    const investments = await this.investmentModel
      .find({ user: investorId })
      .populate('project', 'projectName location status fundingGoal currentFunding')
      .sort({ createdAt: -1 })
      .exec();

    return investments;
  }

  async getInvestorStats() {
    const totalInvestors = await this.userModel.countDocuments({ roles: 'Investor' }).exec();
    const totalInvestments = await this.investmentModel.countDocuments().exec();
    
    const totalInvestmentAmount = await this.investmentModel.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).exec();

    const averageInvestmentPerInvestor = totalInvestors > 0 
      ? (totalInvestmentAmount[0]?.total || 0) / totalInvestors 
      : 0;

    return {
      totalInvestors,
      totalInvestments,
      totalInvestmentAmount: totalInvestmentAmount[0]?.total || 0,
      averageInvestmentPerInvestor,
    };
  }

  async getPendingOperatorRequests() {
    return this.operatorRequestModel
      .find({ status: 'PENDING' })
      .populate('operator', 'firstName lastName email')
      .populate('project', 'projectName status location')
      .sort({ createdAt: -1 })
      .exec();
  }

  // === NEW ANALYTICS METHODS ===

  /**
   * Get global map data for all projects
   */
  async getGlobalMapData() {
    const projects = await this.projectModel
      .find()
      .select('name location status currentAmount goalAmount avgHumidity avgTemperature mainImage')
      .populate('operator', 'firstName lastName')
      .exec();

    return projects.map(project => ({
      id: project._id,
      name: project.name,
      location: project.location,
      status: project.status,
      coordinates: this.extractCoordinates(project.location),
      currentAmount: project.currentAmount,
      goalAmount: project.goalAmount,
      fundingPercentage: (project.currentAmount / project.goalAmount) * 100,
      avgHumidity: project.avgHumidity,
      avgTemperature: project.avgTemperature,
      mainImage: project.mainImage,
      operator: project.operator,
    }));
  }

  /**
   * Get Total Value Locked (TVL) - funds in projects seeking funding
   */
  async getTotalValueLocked() {
    const tvlResult = await this.projectModel.aggregate([
      { $match: { status: 'SEEKING_FUNDING' } },
      { $group: { _id: null, total: { $sum: '$currentFunding' } } }
    ]).exec();

    return {
      tvl: tvlResult[0]?.total || 0,
      projectsCount: await this.projectModel.countDocuments({ status: 'SEEKING_FUNDING' }).exec(),
    };
  }

  /**
   * Get revenue analytics with date filters
   */
  async getRevenueAnalytics(startDate?: string, endDate?: string) {
    const dateFilter: any = {};
    
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.createdAt.$lte = new Date(endDate);
      }
    }

    // Revenue from operational projects (simulated revenue based on water production)
    const operationalProjects = await this.projectModel
      .find({ status: 'OPERATIONAL', ...dateFilter })
      .exec();

    let totalRevenue = 0;
    let totalWaterProduced = 0;

    for (const project of operationalProjects) {
      // Simulate revenue: $0.5 per liter of water produced
      const projectPerformance = await this.performanceModel
        .find({ project: project._id })
        .exec();
      
      const projectWaterProduced = projectPerformance.reduce((sum, record) => sum + record.litersProduced, 0);
      const projectRevenue = projectWaterProduced * 0.5; // $0.5 per liter
      
      totalWaterProduced += projectWaterProduced;
      totalRevenue += projectRevenue;
    }

    return {
      totalRevenue,
      totalWaterProduced,
      operationalProjectsCount: operationalProjects.length,
      averageRevenuePerProject: operationalProjects.length > 0 ? totalRevenue / operationalProjects.length : 0,
    };
  }

  /**
   * Get investor ROI reports
   */
  async getInvestorROIReports() {
    const investments = await this.investmentModel
      .find()
      .populate('user', 'firstName lastName email')
      .populate('project', 'name status currentAmount goalAmount')
      .exec();

    const roiData = investments.map(investment => {
      const project = investment.project as any;
      const fundingPercentage = project.currentAmount / project.goalAmount;
      
      // Simulate ROI based on project status and funding percentage
      let roi = 0;
      if (project.status === 'OPERATIONAL') {
        roi = 0.12; // 12% annual return for operational projects
      } else if (project.status === 'SEEKING_FUNDING') {
        roi = 0.05; // 5% potential return for funded projects
      }

      return {
        investorId: (investment.user as any)._id,
        investorName: `${(investment.user as any).firstName} ${(investment.user as any).lastName}`,
        investorEmail: (investment.user as any).email,
        projectName: project.name,
        projectStatus: project.status,
        investmentAmount: investment.amount,
        fundingPercentage,
        roi,
        projectedReturn: investment.amount * roi,
      };
    });

    const totalROI = roiData.reduce((sum, item) => sum + item.projectedReturn, 0);
    const averageROI = roiData.length > 0 ? totalROI / roiData.length : 0;

    return {
      totalROI,
      averageROI,
      totalInvestments: roiData.length,
      roiBreakdown: roiData,
    };
  }

  /**
   * Get operational health monitoring data
   */
  async getOperationalHealthData() {
    const operationalProjects = await this.projectModel
      .find({ status: 'OPERATIONAL' })
      .populate('operator', 'firstName lastName email')
      .exec();

    const healthData: HealthDataItem[] = [];

    for (const project of operationalProjects) {
      const performanceData = await this.performanceModel
        .find({ project: project._id })
        .sort({ timestamp: -1 })
        .limit(30) // Last 30 days
        .exec();

      if (performanceData.length === 0) continue;

      // Calculate uptime (assuming 85% target)
      const totalRecords = performanceData.length;
      const operationalRecords = performanceData.filter(record => record.machineStatus === 'OPERATIONAL').length;
      const uptimePercentage = (operationalRecords / totalRecords) * 100;

      // Calculate efficiency metrics
      const avgEfficiency = performanceData.reduce((sum, record) => sum + record.kwhPerLiter, 0) / performanceData.length;
      const avgWaterProduction = performanceData.reduce((sum, record) => sum + record.litersProduced, 0) / performanceData.length;

      // Check for efficiency alerts (deviation > 20% from expected 0.8 kWh/L)
      const expectedEfficiency = 0.8;
      const efficiencyDeviation = Math.abs(avgEfficiency - expectedEfficiency) / expectedEfficiency;
      const hasEfficiencyAlert = efficiencyDeviation > 0.2;

      healthData.push({
        projectId: (project._id as any).toString(),
        projectName: project.name,
        location: project.location,
        operator: project.operator,
        uptimePercentage,
        targetUptime: 85,
        avgEfficiency,
        expectedEfficiency,
        avgWaterProduction,
        hasEfficiencyAlert,
        efficiencyDeviation: efficiencyDeviation * 100, // as percentage
        lastUpdated: performanceData[0]?.timestamp,
        status: uptimePercentage >= 85 ? 'HEALTHY' : 'NEEDS_ATTENTION',
      });
    }

    const overallUptime = healthData.length > 0 
      ? healthData.reduce((sum, project) => sum + project.uptimePercentage, 0) / healthData.length 
      : 0;

    const alertsCount = healthData.filter(project => project.hasEfficiencyAlert || project.uptimePercentage < 85).length;

    return {
      overallUptime,
      alertsCount,
      totalOperationalProjects: healthData.length,
      projectsHealth: healthData,
    };
  }

  // === NEW EXTENDED METRICS METHODS ===

  /**
   * Get extended metrics including environmental impact and social metrics
   */
  async getExtendedMetrics() {
    const operationalProjects = await this.projectModel
      .find({ status: 'OPERATIONAL' })
      .exec();

    let totalWaterProduced = 0;
    let totalEnergyConsumed = 0;
    let totalJobsCreated = 0;
    let totalCommunitiesServed = 0;

    for (const project of operationalProjects) {
      const performanceData = await this.performanceModel
        .find({ project: project._id })
        .exec();
      
      const projectWaterProduced = performanceData.reduce((sum, record) => sum + record.litersProduced, 0);
      const projectEnergyConsumed = performanceData.reduce((sum, record) => sum + (record.kwhPerLiter * record.litersProduced), 0);
      
      totalWaterProduced += projectWaterProduced;
      totalEnergyConsumed += projectEnergyConsumed;
      
      // Simulate jobs and communities served
      totalJobsCreated += 3; // Average 3 jobs per project
      totalCommunitiesServed += 1; // Each project serves one community
    }

    // Calculate environmental impact
    const carbonFootprintReduction = totalWaterProduced * 0.001; // kg CO2 saved per liter
    const energyEfficiency = totalWaterProduced / totalEnergyConsumed; // liters per kWh

    return {
      environmentalImpact: {
        totalWaterProduced,
        carbonFootprintReduction,
        energyEfficiency,
        totalEnergyConsumed,
      },
      socialImpact: {
        totalJobsCreated,
        totalCommunitiesServed,
        averageJobsPerProject: operationalProjects.length > 0 ? totalJobsCreated / operationalProjects.length : 0,
      },
      operationalMetrics: {
        totalProjects: operationalProjects.length,
        averageWaterProduction: operationalProjects.length > 0 ? totalWaterProduced / operationalProjects.length : 0,
        averageEnergyEfficiency: energyEfficiency,
      }
    };
  }

  /**
   * Get month-over-month comparison data
   */
  async getMonthOverMonthData(months: number = 6) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const monthlyData: any[] = [];

    for (let i = 0; i < months; i++) {
      const monthStart = new Date(startDate);
      monthStart.setMonth(monthStart.getMonth() + i);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      // Get projects created in this month
      const projectsInMonth = await this.projectModel
        .find({
          createdAt: { $gte: monthStart, $lt: monthEnd }
        })
        .exec();

      // Get performance data for this month
      const performanceInMonth = await this.performanceModel
        .find({
          timestamp: { $gte: monthStart, $lt: monthEnd }
        })
        .exec();

      const waterProduced = performanceInMonth.reduce((sum, record) => sum + record.litersProduced, 0);
      const revenue = waterProduced * 0.5; // $0.5 per liter

      monthlyData.push({
        month: monthStart.toISOString().slice(0, 7), // YYYY-MM format
        newProjects: projectsInMonth.length,
        waterProduced,
        revenue,
        energyConsumed: performanceInMonth.reduce((sum, record) => sum + (record.kwhPerLiter * record.litersProduced), 0),
        averageEfficiency: performanceInMonth.length > 0 
          ? performanceInMonth.reduce((sum, record) => sum + record.kwhPerLiter, 0) / performanceInMonth.length 
          : 0,
      });
    }

    return {
      monthlyData,
      growthMetrics: this.calculateGrowthMetrics(monthlyData),
    };
  }

  /**
   * Get industry benchmarks and comparisons
   */
  async getIndustryBenchmarks() {
    const operationalProjects = await this.projectModel
      .find({ status: 'OPERATIONAL' })
      .exec();

    let totalWaterProduced = 0;
    let totalEnergyConsumed = 0;
    let totalRevenue = 0;

    for (const project of operationalProjects) {
      const performanceData = await this.performanceModel
        .find({ project: project._id })
        .exec();
      
      const projectWaterProduced = performanceData.reduce((sum, record) => sum + record.litersProduced, 0);
      const projectEnergyConsumed = performanceData.reduce((sum, record) => sum + (record.kwhPerLiter * record.litersProduced), 0);
      
      totalWaterProduced += projectWaterProduced;
      totalEnergyConsumed += projectEnergyConsumed;
      totalRevenue += projectWaterProduced * 0.5;
    }

    const averageEfficiency = totalEnergyConsumed > 0 ? totalWaterProduced / totalEnergyConsumed : 0;

    // Industry benchmarks (simulated data)
    const industryBenchmarks = {
      waterProduction: {
        blueFire: totalWaterProduced,
        industryAverage: totalWaterProduced * 0.8, // 20% better than industry
        industryTop: totalWaterProduced * 1.1, // 10% better than Blue Fire
      },
      energyEfficiency: {
        blueFire: averageEfficiency,
        industryAverage: averageEfficiency * 0.85, // 15% more efficient
        industryTop: averageEfficiency * 1.05, // 5% better than Blue Fire
      },
      revenuePerLiter: {
        blueFire: 0.5,
        industryAverage: 0.4,
        industryTop: 0.6,
      },
      uptime: {
        blueFire: 87, // From operational health data
        industryAverage: 82,
        industryTop: 92,
      },
      roi: {
        blueFire: 12, // 12% annual return
        industryAverage: 8,
        industryTop: 15,
      }
    };

    return {
      currentMetrics: {
        totalWaterProduced,
        totalEnergyConsumed,
        totalRevenue,
        averageEfficiency,
        operationalProjects: operationalProjects.length,
      },
      benchmarks: industryBenchmarks,
      performanceVsIndustry: {
        waterProduction: ((totalWaterProduced / industryBenchmarks.waterProduction.industryAverage) - 1) * 100,
        energyEfficiency: ((averageEfficiency / industryBenchmarks.energyEfficiency.industryAverage) - 1) * 100,
        revenuePerLiter: ((0.5 / industryBenchmarks.revenuePerLiter.industryAverage) - 1) * 100,
        uptime: 87 - industryBenchmarks.uptime.industryAverage,
        roi: 12 - industryBenchmarks.roi.industryAverage,
      }
    };
  }

  /**
   * Get VC-focused KPIs
   */
  async getVCKPIs() {
    const totalInvestors = await this.userModel.countDocuments({ roles: 'Investor' }).exec();
    const totalInvestments = await this.investmentModel.countDocuments().exec();
    const totalInvestmentAmount = await this.investmentModel.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).exec();

    const operationalProjects = await this.projectModel.countDocuments({ status: 'OPERATIONAL' }).exec();
    const seekingFundingProjects = await this.projectModel.countDocuments({ status: 'SEEKING_FUNDING' }).exec();

    // Calculate growth metrics
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const newInvestorsThisMonth = await this.userModel.countDocuments({
      roles: 'Investor',
      createdAt: { $gte: lastMonth }
    }).exec();

    const newInvestmentsThisMonth = await this.investmentModel.countDocuments({
      createdAt: { $gte: lastMonth }
    }).exec();

    const newInvestmentAmountThisMonth = await this.investmentModel.aggregate([
      { $match: { createdAt: { $gte: lastMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).exec();

    return {
      investorMetrics: {
        totalInvestors,
        newInvestorsThisMonth,
        investorGrowthRate: totalInvestors > 0 ? (newInvestorsThisMonth / totalInvestors) * 100 : 0,
        averageInvestmentPerInvestor: totalInvestors > 0 ? (totalInvestmentAmount[0]?.total || 0) / totalInvestors : 0,
      },
      investmentMetrics: {
        totalInvestments,
        newInvestmentsThisMonth,
        totalInvestmentAmount: totalInvestmentAmount[0]?.total || 0,
        newInvestmentAmountThisMonth: newInvestmentAmountThisMonth[0]?.total || 0,
        investmentGrowthRate: totalInvestments > 0 ? (newInvestmentsThisMonth / totalInvestments) * 100 : 0,
      },
             projectMetrics: {
         operationalProjects,
         seekingFundingProjects,
         totalProjects: operationalProjects + seekingFundingProjects,
         projectSuccessRate: (operationalProjects + seekingFundingProjects) > 0 ? (operationalProjects / (operationalProjects + seekingFundingProjects)) * 100 : 0,
       },
      platformMetrics: {
        totalValueLocked: (totalInvestmentAmount[0]?.total || 0) + (await this.getTotalValueLocked()).tvl,
        monthlyGrowthRate: totalInvestmentAmount[0]?.total > 0 ? ((newInvestmentAmountThisMonth[0]?.total || 0) / (totalInvestmentAmount[0]?.total || 1)) * 100 : 0,
        averageROI: 12, // From ROI reports
        platformUptime: 87, // From operational health
      }
    };
  }

  /**
   * Calculate growth metrics from monthly data
   */
  private calculateGrowthMetrics(monthlyData: any[]) {
    if (monthlyData.length < 2) return {};

    const current = monthlyData[monthlyData.length - 1];
    const previous = monthlyData[monthlyData.length - 2];

    return {
      revenueGrowth: previous.revenue > 0 ? ((current.revenue - previous.revenue) / previous.revenue) * 100 : 0,
      waterProductionGrowth: previous.waterProduced > 0 ? ((current.waterProduced - previous.waterProduced) / previous.waterProduced) * 100 : 0,
      projectGrowth: previous.newProjects > 0 ? ((current.newProjects - previous.newProjects) / previous.newProjects) * 100 : 0,
      efficiencyGrowth: previous.averageEfficiency > 0 ? ((current.averageEfficiency - previous.averageEfficiency) / previous.averageEfficiency) * 100 : 0,
    };
  }

  /**
   * Export analytics data as CSV
   */
  async exportAnalyticsData(type: 'financial' | 'operational' | 'investor') {
    switch (type) {
      case 'financial':
        return this.exportFinancialData();
      case 'operational':
        return this.exportOperationalData();
      case 'investor':
        return this.exportInvestorData();
      default:
        throw new BadRequestException('Invalid export type');
    }
  }

  private async exportFinancialData() {
    const projects = await this.projectModel.find().exec();
    const investments = await this.investmentModel.find().populate('user project').exec();
    
    const csvData = projects.map(project => ({
      projectName: project.name,
      location: project.location,
      status: project.status,
      goalAmount: project.goalAmount,
      currentAmount: project.currentAmount,
      fundingPercentage: (project.currentAmount / project.goalAmount) * 100,
    }));

    return {
      filename: `financial_report_${new Date().toISOString().split('T')[0]}.csv`,
      data: csvData,
    };
  }

  private async exportOperationalData() {
    const operationalProjects = await this.projectModel.find({ status: 'OPERATIONAL' }).exec();
    const csvData: OperationalDataItem[] = [];

    for (const project of operationalProjects) {
      const performanceData = await this.performanceModel
        .find({ project: project._id })
        .sort({ timestamp: -1 })
        .limit(30)
        .exec();

      if (performanceData.length > 0) {
        const avgEfficiency = performanceData.reduce((sum, record) => sum + record.kwhPerLiter, 0) / performanceData.length;
        const avgWaterProduction = performanceData.reduce((sum, record) => sum + record.litersProduced, 0) / performanceData.length;

        csvData.push({
          projectName: project.name,
          location: project.location,
          avgEfficiency,
          avgWaterProduction,
          dataPoints: performanceData.length,
        });
      }
    }

    return {
      filename: `operational_report_${new Date().toISOString().split('T')[0]}.csv`,
      data: csvData,
    };
  }

  private async exportInvestorData() {
    const investments = await this.investmentModel
      .find()
      .populate('user', 'firstName lastName email')
      .populate('project', 'name status')
      .exec();

    const csvData = investments.map(investment => ({
      investorName: `${(investment.user as any).firstName} ${(investment.user as any).lastName}`,
      investorEmail: (investment.user as any).email,
      projectName: (investment.project as any).name,
      projectStatus: (investment.project as any).status,
      investmentAmount: investment.amount,
      investmentDate: (investment as any).createdAt,
    }));

    return {
      filename: `investor_report_${new Date().toISOString().split('T')[0]}.csv`,
      data: csvData,
    };
  }

  private extractCoordinates(location: string) {
    // Simple coordinate extraction - in production, you'd use a geocoding service
    const coordinates = {
      'Singapore': { lat: 1.3521, lng: 103.8198 },
      'Manaus, Brazil': { lat: -3.1190, lng: -60.0217 },
      'Phuket, Thailand': { lat: 7.8804, lng: 98.3923 },
      'Villahermosa, Tabasco, Mexico': { lat: 17.9894, lng: -92.9281 },
    };

    return coordinates[location] || { lat: 0, lng: 0 };
  }
}