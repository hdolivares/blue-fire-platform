import { Controller, Get, Post, Patch, Param, Body, Query, Request, ForbiddenException } from '@nestjs/common';
import { AlertsService, Alert, AlertRule, AlertCondition } from '../services/alerts.service';
import { AdminOnly } from '../common/decorators/auth.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  // Non-admins may only read their own alerts — the :userId path param is not
  // trusted on its own (IDOR). Alerts are mock/in-memory today, but the route
  // contract must not leak other users' data once the store is real.
  private assertOwnAlertsOrAdmin(req: any, userId: string) {
    const requester = req.user ?? {};
    const isAdmin = Array.isArray(requester.roles) && requester.roles.includes('Admin');
    if (!isAdmin && String(requester.userId) !== String(userId)) {
      throw new ForbiddenException('You can only access your own alerts');
    }
  }

  // === ALERT MANAGEMENT ===
  @Get()
  @AdminOnly()
  async getAlerts(@Query() filters: {
    type?: Alert['type'];
    severity?: Alert['severity'];
    isRead?: boolean;
    isResolved?: boolean;
    projectId?: string;
    userId?: string;
  }) {
    return this.alertsService.getAlerts(filters);
  }

  @Get('stats')
  @AdminOnly()
  async getAlertStats() {
    return this.alertsService.getAlertStats();
  }

  @Get('realtime')
  @AdminOnly()
  async getRealTimeAlerts() {
    return this.alertsService.getRealTimeAlerts();
  }

  @Get(':id')
  @AdminOnly()
  async getAlertById(@Param('id') id: string) {
    return this.alertsService.getAlertById(id);
  }

  @Post()
  @AdminOnly()
  async createAlert(@Body() alertData: {
    type: Alert['type'];
    severity: Alert['severity'];
    title: string;
    message: string;
    projectId?: string;
    sensorId?: string;
    userId?: string;
    metadata?: Record<string, any>;
  }) {
    return this.alertsService.createAlert(alertData);
  }

  @Patch(':id/read')
  @AdminOnly()
  async markAlertAsRead(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return this.alertsService.markAlertAsRead(id, userId);
  }

  @Patch(':id/resolve')
  @AdminOnly()
  async resolveAlert(
    @Param('id') id: string,
    @Body('resolvedBy') resolvedBy: string,
  ) {
    return this.alertsService.resolveAlert(id, resolvedBy);
  }

  // === ALERT RULES ===
  @Get('rules')
  @AdminOnly()
  async getAlertRules() {
    return this.alertsService.getAlertRules();
  }

  @Post('rules')
  @AdminOnly()
  async createAlertRule(@Body() ruleData: {
    name: string;
    description: string;
    type: Alert['type'];
    severity: Alert['severity'];
    conditions: AlertCondition[];
    isActive: boolean;
  }) {
    return this.alertsService.createAlertRule(ruleData);
  }

  // === USER-SPECIFIC ALERTS ===
  @Get('user/:userId')
  @Roles('Admin', 'Investor', 'Operator')
  async getUserAlerts(@Request() req, @Param('userId') userId: string) {
    this.assertOwnAlertsOrAdmin(req, userId);
    return this.alertsService.getAlerts({ userId });
  }

  @Get('user/:userId/unread')
  @Roles('Admin', 'Investor', 'Operator')
  async getUserUnreadAlerts(@Request() req, @Param('userId') userId: string) {
    this.assertOwnAlertsOrAdmin(req, userId);
    return this.alertsService.getAlerts({ userId, isRead: false });
  }

  @Get('user/:userId/count')
  @Roles('Admin', 'Investor', 'Operator')
  async getUserAlertCount(@Request() req, @Param('userId') userId: string) {
    this.assertOwnAlertsOrAdmin(req, userId);
    const alerts = await this.alertsService.getAlerts({ userId });
    const unreadCount = alerts.filter(alert => !alert.isRead).length;
    const unresolvedCount = alerts.filter(alert => !alert.isResolved).length;
    
    return {
      total: alerts.length,
      unread: unreadCount,
      unresolved: unresolvedCount,
    };
  }

  // === PROJECT-SPECIFIC ALERTS ===
  @Get('project/:projectId')
  @AdminOnly()
  async getProjectAlerts(@Param('projectId') projectId: string) {
    return this.alertsService.getAlerts({ projectId });
  }

  @Get('project/:projectId/active')
  @AdminOnly()
  async getProjectActiveAlerts(@Param('projectId') projectId: string) {
    return this.alertsService.getAlerts({ projectId, isResolved: false });
  }

  // === SYSTEM ALERTS ===
  @Get('system/overview')
  @AdminOnly()
  async getSystemAlertOverview() {
    const stats = await this.alertsService.getAlertStats();
    const recentAlerts = await this.alertsService.getAlerts({ isResolved: false });
    
    return {
      stats,
      recentAlerts: recentAlerts.slice(0, 10),
      criticalAlerts: recentAlerts.filter(alert => alert.severity === 'CRITICAL'),
      highPriorityAlerts: recentAlerts.filter(alert => 
        alert.severity === 'HIGH' || alert.severity === 'CRITICAL'
      ),
    };
  }

  // === NOTIFICATION ENDPOINTS ===
  @Post('test')
  @AdminOnly()
  async createTestAlert() {
    const testAlerts = [
      {
        type: 'PERFORMANCE' as const,
        severity: 'MEDIUM' as const,
        title: 'Low Efficiency Detected',
        message: 'Project efficiency has dropped below 70%',
        projectId: 'test-project-1',
        metadata: { efficiency: 0.65, projectName: 'Singapore Water Plant' },
      },
      {
        type: 'IOT' as const,
        severity: 'HIGH' as const,
        title: 'Sensor Offline',
        message: 'Temperature sensor SENSOR-001 has gone offline',
        sensorId: 'SENSOR-001',
        projectId: 'test-project-2',
        metadata: { sensorType: 'temperature', lastReading: 25.5 },
      },
      {
        type: 'BLOCKCHAIN' as const,
        severity: 'CRITICAL' as const,
        title: 'Blockchain Connection Lost',
        message: 'Connection to RSK blockchain has been lost',
        metadata: { networkId: 30, lastBlock: 12345678 },
      },
      {
        type: 'INVESTMENT' as const,
        severity: 'LOW' as const,
        title: 'Funding Milestone Reached',
        message: 'Project has reached 90% funding goal',
        projectId: 'test-project-3',
        metadata: { fundingPercentage: 92, goalAmount: 500000 },
      },
    ];

    const createdAlerts: Alert[] = [];
    for (const alertData of testAlerts) {
      const alert = await this.alertsService.createAlert(alertData);
      createdAlerts.push(alert);
    }

    return {
      message: 'Test alerts created successfully',
      alerts: createdAlerts,
    };
  }
} 