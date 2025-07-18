import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface Alert {
  id: string;
  type: 'SYSTEM' | 'PERFORMANCE' | 'SECURITY' | 'MAINTENANCE' | 'INVESTMENT' | 'BLOCKCHAIN' | 'IOT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  projectId?: string;
  sensorId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  type: Alert['type'];
  severity: Alert['severity'];
  conditions: AlertCondition[];
  isActive: boolean;
  createdAt: Date;
}

export interface AlertCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: any;
}

export interface Notification {
  id: string;
  userId: string;
  alertId: string;
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  status: 'PENDING' | 'SENT' | 'FAILED';
  sentAt?: Date;
  createdAt: Date;
}

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);
  private alerts: Alert[] = [];
  private alertRules: AlertRule[] = [];

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {
    this.initializeDefaultRules();
    this.initializeDefaultAlerts();
  }

  /**
   * Create a new alert
   */
  async createAlert(alertData: Omit<Alert, 'id' | 'isRead' | 'isResolved' | 'createdAt' | 'updatedAt'>): Promise<Alert> {
    const alert: Alert = {
      id: this.generateId(),
      ...alertData,
      isRead: false,
      isResolved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.alerts.push(alert);
    
    // Emit event for real-time notifications
    this.eventEmitter.emit('alert.created', alert);
    
    // Send notifications
    await this.sendNotifications(alert);
    
    this.logger.log(`Alert created: ${alert.title} (${alert.severity})`);
    return alert;
  }

  /**
   * Get all alerts with filters
   */
  async getAlerts(filters?: {
    type?: Alert['type'];
    severity?: Alert['severity'];
    isRead?: boolean;
    isResolved?: boolean;
    projectId?: string;
    userId?: string;
  }): Promise<Alert[]> {
    let filteredAlerts = [...this.alerts];

    if (filters?.type) {
      filteredAlerts = filteredAlerts.filter(alert => alert.type === filters.type);
    }

    if (filters?.severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === filters.severity);
    }

    if (filters?.isRead !== undefined) {
      filteredAlerts = filteredAlerts.filter(alert => alert.isRead === filters.isRead);
    }

    if (filters?.isResolved !== undefined) {
      filteredAlerts = filteredAlerts.filter(alert => alert.isResolved === filters.isResolved);
    }

    if (filters?.projectId) {
      filteredAlerts = filteredAlerts.filter(alert => alert.projectId === filters.projectId);
    }

    if (filters?.userId) {
      filteredAlerts = filteredAlerts.filter(alert => alert.userId === filters.userId);
    }

    return filteredAlerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get alert by ID
   */
  async getAlertById(alertId: string): Promise<Alert | null> {
    return this.alerts.find(alert => alert.id === alertId) || null;
  }

  /**
   * Mark alert as read
   */
  async markAlertAsRead(alertId: string, userId: string): Promise<Alert | null> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
      alert.updatedAt = new Date();
      this.eventEmitter.emit('alert.updated', alert);
      return alert;
    }
    return null;
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string, resolvedBy: string): Promise<Alert | null> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isResolved = true;
      alert.resolvedAt = new Date();
      alert.resolvedBy = resolvedBy;
      alert.updatedAt = new Date();
      this.eventEmitter.emit('alert.resolved', alert);
      return alert;
    }
    return null;
  }

  /**
   * Get alert statistics
   */
  async getAlertStats(): Promise<{
    total: number;
    unread: number;
    unresolved: number;
    bySeverity: Record<Alert['severity'], number>;
    byType: Record<Alert['type'], number>;
    recentAlerts: Alert[];
  }> {
    const total = this.alerts.length;
    const unread = this.alerts.filter(alert => !alert.isRead).length;
    const unresolved = this.alerts.filter(alert => !alert.isResolved).length;

    const bySeverity = {
      LOW: this.alerts.filter(alert => alert.severity === 'LOW').length,
      MEDIUM: this.alerts.filter(alert => alert.severity === 'MEDIUM').length,
      HIGH: this.alerts.filter(alert => alert.severity === 'HIGH').length,
      CRITICAL: this.alerts.filter(alert => alert.severity === 'CRITICAL').length,
    };

    const byType = {
      SYSTEM: this.alerts.filter(alert => alert.type === 'SYSTEM').length,
      PERFORMANCE: this.alerts.filter(alert => alert.type === 'PERFORMANCE').length,
      SECURITY: this.alerts.filter(alert => alert.type === 'SECURITY').length,
      MAINTENANCE: this.alerts.filter(alert => alert.type === 'MAINTENANCE').length,
      INVESTMENT: this.alerts.filter(alert => alert.type === 'INVESTMENT').length,
      BLOCKCHAIN: this.alerts.filter(alert => alert.type === 'BLOCKCHAIN').length,
      IOT: this.alerts.filter(alert => alert.type === 'IOT').length,
    };

    const recentAlerts = this.alerts
      .filter(alert => !alert.isResolved)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    return {
      total,
      unread,
      unresolved,
      bySeverity,
      byType,
      recentAlerts,
    };
  }

  /**
   * Create alert rule
   */
  async createAlertRule(ruleData: Omit<AlertRule, 'id' | 'createdAt'>): Promise<AlertRule> {
    const rule: AlertRule = {
      id: this.generateId(),
      ...ruleData,
      createdAt: new Date(),
    };

    this.alertRules.push(rule);
    this.logger.log(`Alert rule created: ${rule.name}`);
    return rule;
  }

  /**
   * Get all alert rules
   */
  async getAlertRules(): Promise<AlertRule[]> {
    return [...this.alertRules];
  }

  /**
   * Check conditions and create alerts automatically
   */
  async checkConditions(data: Record<string, any>, context?: { projectId?: string; userId?: string }): Promise<void> {
    for (const rule of this.alertRules.filter(r => r.isActive)) {
      const shouldTrigger = this.evaluateConditions(rule.conditions, data);
      
      if (shouldTrigger) {
        await this.createAlert({
          type: rule.type,
          severity: rule.severity,
          title: rule.name,
          message: rule.description,
          projectId: context?.projectId,
          userId: context?.userId,
          metadata: data,
        });
      }
    }
  }

  /**
   * Evaluate alert conditions
   */
  private evaluateConditions(conditions: AlertCondition[], data: Record<string, any>): boolean {
    return conditions.every(condition => {
      const value = data[condition.field];
      
      switch (condition.operator) {
        case 'equals':
          return value === condition.value;
        case 'not_equals':
          return value !== condition.value;
        case 'greater_than':
          return value > condition.value;
        case 'less_than':
          return value < condition.value;
        case 'contains':
          return String(value).includes(String(condition.value));
        case 'not_contains':
          return !String(value).includes(String(condition.value));
        default:
          return false;
      }
    });
  }

  /**
   * Send notifications for an alert
   */
  private async sendNotifications(alert: Alert): Promise<void> {
    try {
      // In a real implementation, you would:
      // 1. Get users who should receive this alert
      // 2. Send email notifications
      // 3. Send SMS notifications
      // 4. Send push notifications
      // 5. Store notification records

      this.logger.log(`Sending notifications for alert: ${alert.id}`);
      
      // Simulate notification sending
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      this.logger.error('Error sending notifications:', error);
    }
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultRules(): void {
    const defaultRules: Omit<AlertRule, 'id' | 'createdAt'>[] = [
      {
        name: 'Low Efficiency Alert',
        description: 'Project efficiency drops below 70%',
        type: 'PERFORMANCE',
        severity: 'MEDIUM',
        conditions: [
          { field: 'efficiency', operator: 'less_than', value: 0.7 }
        ],
        isActive: true,
      },
      {
        name: 'High Energy Consumption',
        description: 'Energy consumption exceeds normal range',
        type: 'PERFORMANCE',
        severity: 'HIGH',
        conditions: [
          { field: 'energyConsumption', operator: 'greater_than', value: 10 }
        ],
        isActive: true,
      },
      {
        name: 'Sensor Offline',
        description: 'IoT sensor goes offline',
        type: 'IOT',
        severity: 'HIGH',
        conditions: [
          { field: 'status', operator: 'equals', value: 'OFFLINE' }
        ],
        isActive: true,
      },
      {
        name: 'Blockchain Connection Lost',
        description: 'Connection to RSK blockchain lost',
        type: 'BLOCKCHAIN',
        severity: 'CRITICAL',
        conditions: [
          { field: 'isConnected', operator: 'equals', value: false }
        ],
        isActive: true,
      },
      {
        name: 'Investment Threshold Reached',
        description: 'Project reaches 90% funding',
        type: 'INVESTMENT',
        severity: 'LOW',
        conditions: [
          { field: 'fundingPercentage', operator: 'greater_than', value: 90 }
        ],
        isActive: true,
      },
    ];

    defaultRules.forEach(rule => {
      this.alertRules.push({
        id: this.generateId(),
        ...rule,
        createdAt: new Date(),
      });
    });
  }

  /**
   * Initialize default alerts for demonstration
   */
  private initializeDefaultAlerts(): void {
    const defaultAlerts: Omit<Alert, 'id' | 'isRead' | 'isResolved' | 'createdAt' | 'updatedAt'>[] = [
      {
        type: 'PERFORMANCE',
        severity: 'MEDIUM',
        title: 'Low Efficiency Detected',
        message: 'Project efficiency has dropped below 70%',
        projectId: 'project-1',
        metadata: { efficiency: 0.65, projectName: 'Singapore Water Plant' },
      },
      {
        type: 'IOT',
        severity: 'HIGH',
        title: 'Sensor Offline',
        message: 'Temperature sensor SENSOR-001 has gone offline',
        sensorId: 'SENSOR-001',
        projectId: 'project-2',
        metadata: { sensorType: 'temperature', lastReading: 25.5 },
      },
      {
        type: 'BLOCKCHAIN',
        severity: 'CRITICAL',
        title: 'Blockchain Connection Lost',
        message: 'Connection to RSK blockchain has been lost',
        metadata: { networkId: 30, lastBlock: 12345678 },
      },
      {
        type: 'INVESTMENT',
        severity: 'LOW',
        title: 'Funding Milestone Reached',
        message: 'Project has reached 90% funding goal',
        projectId: 'project-3',
        metadata: { fundingPercentage: 92, goalAmount: 500000 },
      },
      {
        type: 'MAINTENANCE',
        severity: 'MEDIUM',
        title: 'Maintenance Due',
        message: 'Equipment maintenance is due in 5 days',
        projectId: 'project-1',
        metadata: { daysUntilMaintenance: 5, equipmentType: 'water_filter' },
      },
    ];

    defaultAlerts.forEach(alertData => {
      const alert: Alert = {
        id: this.generateId(),
        ...alertData,
        isRead: false,
        isResolved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.alerts.push(alert);
    });

    this.logger.log(`Initialized ${defaultAlerts.length} default alerts`);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get real-time alert updates
   */
  async getRealTimeAlerts(): Promise<{
    activeAlerts: Alert[];
    alertStats: any;
    recentActivity: any[];
  }> {
    const activeAlerts = this.alerts.filter(alert => !alert.isResolved);
    const alertStats = await this.getAlertStats();
    
    const recentActivity = this.alerts
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 20)
      .map(alert => ({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        isResolved: alert.isResolved,
        updatedAt: alert.updatedAt,
      }));

    return {
      activeAlerts,
      alertStats,
      recentActivity,
    };
  }
} 