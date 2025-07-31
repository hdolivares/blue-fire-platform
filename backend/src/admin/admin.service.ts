// In backend/src/admin/admin.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from '../projects/schemas/project.schema';
import { User } from '../users/schemas/user.schema';
import { Investment } from '../investments/schemas/investment.schema';
import { PerformanceData } from '../performance/schemas/performance-data.schema';
import { OperatorRequest } from '../operators/schemas/operator-request.schema';
import { BlockchainService } from '../services/blockchain.service';
import { IoTService } from '../services/iot.service';
import { MarketService } from '../services/market.service';

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
    @InjectModel(PerformanceData.name) private performanceModel: Model<PerformanceData>,
    @InjectModel(OperatorRequest.name) private operatorRequestModel: Model<OperatorRequest>,
    public blockchainService: BlockchainService,
    public iotService: IoTService,
    public marketService: MarketService,
  ) {}

  // === EXISTING METHODS ===

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

  async getTotalValueLocked() {
    // Integrate with real blockchain data
    const factoryInfo = await this.blockchainService.getFactoryInfo();
    const projectCount = await this.blockchainService.getProjectCount();
    
    // Calculate TVL from projects
    let totalValueLocked = 0;
    for (let i = 0; i < projectCount; i++) {
      try {
        const projectInfo = await this.blockchainService.getProjectInfo(i);
        totalValueLocked += parseFloat(projectInfo.totalFunded);
      } catch (error) {
        // Skip if project doesn't exist or error
        console.warn(`Could not get project ${i} info:`, error.message);
      }
    }
    
    return {
      tvl: totalValueLocked,
      projectsCount: await this.projectModel.countDocuments({ status: 'SEEKING_FUNDING' }).exec(),
      blockchainData: {
        factoryInfo,
        projectCount,
        totalValueLocked,
      },
    };
  }

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

    // Get IoT data for enhanced revenue calculation
    const iotMetrics = await this.iotService.getIoTMetrics();
    
    const operationalProjects = await this.projectModel
      .find({ status: 'OPERATIONAL', ...dateFilter })
      .exec();

    let totalRevenue = 0;
    let totalWaterProduced = 0;

    for (const project of operationalProjects) {
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
      iotMetrics, // Include IoT data
    };
  }

  async getInvestorROIReports() {
    const investments = await this.investmentModel
      .find()
      .populate('user', 'firstName lastName email')
      .populate('project', 'name status currentAmount goalAmount')
      .exec();

    const roiData = investments.map(investment => {
      const project = investment.project as any;
      const fundingPercentage = project.currentAmount / project.goalAmount;
      
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
        .limit(30)
        .exec();

      if (performanceData.length === 0) continue;

      // Get IoT sensor data for enhanced health monitoring
      const sensorData = await this.iotService.getSensorData((project._id as any).toString());
      const sensorEfficiency = await this.iotService.getSensorEfficiency((project._id as any).toString());

      const totalRecords = performanceData.length;
      const operationalRecords = performanceData.filter(record => record.machineStatus === 'OPERATIONAL').length;
      const uptimePercentage = (operationalRecords / totalRecords) * 100;

      const avgEfficiency = performanceData.reduce((sum, record) => sum + record.kwhPerLiter, 0) / performanceData.length;
      const avgWaterProduction = performanceData.reduce((sum, record) => sum + record.litersProduced, 0) / performanceData.length;

      const expectedEfficiency = 0.8;
      const efficiencyDeviation = Math.abs(avgEfficiency - expectedEfficiency) / expectedEfficiency;
      const hasEfficiencyAlert = efficiencyDeviation > 0.2;

      healthData.push({
        projectId: (project._id as any).toString(),
        projectName: project.name,
        location: project.location,
        operator: project.operator,
        uptimePercentage: Math.max(uptimePercentage, sensorEfficiency.uptime),
        targetUptime: 85,
        avgEfficiency: Math.min(avgEfficiency, sensorEfficiency.energyEfficiency),
        expectedEfficiency,
        avgWaterProduction,
        hasEfficiencyAlert,
        efficiencyDeviation: efficiencyDeviation * 100,
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

  async getExtendedMetrics() {
    const operationalProjects = await this.projectModel
      .find({ status: 'OPERATIONAL' })
      .exec();

    // Get IoT metrics for enhanced environmental impact
    const iotMetrics = await this.iotService.getIoTMetrics();
    
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
      
      totalJobsCreated += 3;
      totalCommunitiesServed += 1;
    }

    const carbonFootprintReduction = totalWaterProduced * 0.001;
    const energyEfficiency = totalWaterProduced / totalEnergyConsumed;

    return {
      environmentalImpact: {
        totalWaterProduced,
        carbonFootprintReduction,
        energyEfficiency,
        totalEnergyConsumed,
        iotMetrics, // Include IoT data
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

      const projectsInMonth = await this.projectModel
        .find({
          createdAt: { $gte: monthStart, $lt: monthEnd }
        })
        .exec();

      const performanceInMonth = await this.performanceModel
        .find({
          timestamp: { $gte: monthStart, $lt: monthEnd }
        })
        .exec();

      const waterProduced = performanceInMonth.reduce((sum, record) => sum + record.litersProduced, 0);
      const revenue = waterProduced * 0.5;

      monthlyData.push({
        month: monthStart.toISOString().slice(0, 7),
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

  async getIndustryBenchmarks() {
    // Integrate with real market data
    const marketData = await this.marketService.getMarketData();
    const competitorData = await this.marketService.getCompetitorAnalysis();
    const industryBenchmarks = await this.marketService.getIndustryBenchmarks();

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

    return {
      currentMetrics: {
        totalWaterProduced,
        totalEnergyConsumed,
        totalRevenue,
        averageEfficiency,
        operationalProjects: operationalProjects.length,
      },
      marketData, // Include real market data
      competitorData, // Include competitor analysis
      benchmarks: industryBenchmarks, // Include industry benchmarks
      performanceVsIndustry: {
        waterProduction: ((totalWaterProduced / (marketData.averageEfficiency * 1000)) - 1) * 100,
        energyEfficiency: ((averageEfficiency / marketData.averageEfficiency) - 1) * 100,
        revenuePerLiter: ((0.5 / marketData.averageRevenuePerLiter) - 1) * 100,
        uptime: 87 - marketData.averageUptime,
        roi: 12 - marketData.averageROI,
      }
    };
  }

  async getVCKPIs() {
    // Integrate with blockchain data
    const factoryInfo = await this.blockchainService.getFactoryInfo();
    
    const totalInvestors = await this.userModel.countDocuments({ roles: 'Investor' }).exec();
    const totalInvestments = await this.investmentModel.countDocuments().exec();
    const totalInvestmentAmount = await this.investmentModel.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).exec();

    const operationalProjects = await this.projectModel.countDocuments({ status: 'OPERATIONAL' }).exec();
    const seekingFundingProjects = await this.projectModel.countDocuments({ status: 'SEEKING_FUNDING' }).exec();

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
        totalValueLocked: 0, // Will be calculated from projects
        monthlyGrowthRate: totalInvestmentAmount[0]?.total > 0 ? ((newInvestmentAmountThisMonth[0]?.total || 0) / (totalInvestmentAmount[0]?.total || 1)) * 100 : 0,
        averageROI: 12,
        platformUptime: 87,
        factoryInfo, // Include factory data
      }
    };
  }

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
    const coordinates = {
      'Singapore': { lat: 1.3521, lng: 103.8198 },
      'Manaus, Brazil': { lat: -3.1190, lng: -60.0217 },
      'Phuket, Thailand': { lat: 7.8804, lng: 98.3923 },
      'Villahermosa, Tabasco, Mexico': { lat: 17.9894, lng: -92.9281 },
    };

    return coordinates[location] || { lat: 0, lng: 0 };
  }

  // === ADDITIONAL ADMIN METHODS ===

  async getDashboardStats() {
    const totalInvestors = await this.userModel.countDocuments({ roles: 'Investor' }).exec();
    const projectsSeekingFunding = await this.projectModel.countDocuments({ status: 'SEEKING_FUNDING' }).exec();
    const operationalUnits = await this.projectModel.countDocuments({ status: 'OPERATIONAL' }).exec();
    
    const totalCapitalResult = await this.projectModel.aggregate([
      { $group: { _id: null, total: { $sum: '$currentFunding' } } }
    ]).exec();
    
    const totalCapitalRaised = totalCapitalResult[0]?.total || 0;

    return {
      totalInvestors,
      projectsSeekingFunding,
      operationalUnits,
      totalCapitalRaised,
    };
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

  async assignOperatorToProject(projectId: string, operatorId: string) {
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new BadRequestException('Project not found');
    }

    const operator = await this.userModel.findById(operatorId);
    if (!operator) {
      throw new BadRequestException('Operator user not found');
    }

    if (!operator.roles.includes('Operator')) {
      throw new BadRequestException('This user is not an Operator');
    }

    project.operator = operator;
    return project.save();
  }

  async updateProjectStatus(projectId: string, status: string) {
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new BadRequestException('Project not found');
    }

    // Validate status is one of the allowed values
    const validStatuses = ['SEEKING_FUNDING', 'FUNDED_ORDER_PLACED', 'FUNDED_MACHINE_SHIPPED', 'FUNDED_INSTALLATION_PHASE', 'OPERATIONAL'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    project.status = status as any;
    const updatedProject = await project.save();
    
    console.log(`✅ Admin updated project ${projectId} status to ${status}`);
    return updatedProject;
  }

  async getPendingOperatorRequests() {
    const requests = await this.operatorRequestModel
      .find()
      .populate('operator', 'firstName lastName email')
      .populate('project', 'projectName status location')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
    
    return requests;
  }

  async getAllProjects() {
    const projects = await this.projectModel
      .find()
      .populate('operator', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
    
    return projects;
  }

  async getProjectStats() {
    const [
      totalProjects,
      seekingFundingProjects,
      fundedProjects,
      operationalProjects,
      totalFundingGoal,
      totalCurrentFunding,
    ] = await Promise.all([
      this.projectModel.countDocuments(),
      this.projectModel.countDocuments({ status: 'SEEKING_FUNDING' }),
      this.projectModel.countDocuments({ 
        status: { $in: ['FUNDED_ORDER_PLACED', 'FUNDED_MACHINE_SHIPPED', 'FUNDED_INSTALLATION_PHASE'] }
      }),
      this.projectModel.countDocuments({ status: 'OPERATIONAL' }),
      this.projectModel.aggregate([
        { $group: { _id: null, total: { $sum: '$goalAmount' } } }
      ]),
      this.projectModel.aggregate([
        { $group: { _id: null, total: { $sum: '$currentAmount' } } }
      ]),
    ]);

    return {
      totalProjects,
      seekingFundingProjects,
      fundedProjects,
      operationalProjects,
      totalFundingGoal: totalFundingGoal[0]?.total || 0,
      totalCurrentFunding: totalCurrentFunding[0]?.total || 0,
      fundingProgress: totalFundingGoal[0]?.total ? 
        (totalCurrentFunding[0]?.total || 0) / totalFundingGoal[0].total * 100 : 0,
    };
  }
}