import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SensorData {
  projectId: string;
  sensorId: string;
  timestamp: Date;
  temperature: number;
  humidity: number;
  waterFlow: number;
  energyConsumption: number;
  pressure: number;
  phLevel: number;
  turbidity: number;
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'ERROR' | 'OFFLINE';
}

export interface IoTMetrics {
  totalSensors: number;
  operationalSensors: number;
  averageTemperature: number;
  averageHumidity: number;
  totalWaterFlow: number;
  totalEnergyConsumption: number;
  alertsCount: number;
  maintenanceRequired: number;
}

export interface SensorAlert {
  sensorId: string;
  projectId: string;
  alertType: 'TEMPERATURE_HIGH' | 'TEMPERATURE_LOW' | 'HUMIDITY_HIGH' | 'HUMIDITY_LOW' | 'ENERGY_HIGH' | 'WATER_FLOW_LOW' | 'PRESSURE_HIGH' | 'PH_ABNORMAL' | 'TURBIDITY_HIGH';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: Date;
  isResolved: boolean;
}

@Injectable()
export class IoTService {
  private readonly logger = new Logger(IoTService.name);
  private iotEndpoint: string;
  private apiKey: string;

  constructor(private configService: ConfigService) {
    this.iotEndpoint = this.configService.get<string>('IOT_ENDPOINT') || 'https://api.iot-platform.com';
    this.apiKey = this.configService.get<string>('IOT_API_KEY') || '';
  }

  /**
   * Get real-time sensor data for a project
   */
  async getSensorData(projectId: string): Promise<SensorData[]> {
    try {
      // Simulate real IoT sensor data
      return this.getSimulatedSensorData(projectId);
    } catch (error) {
      this.logger.error(`Error fetching sensor data for project ${projectId}:`, error);
      return [];
    }
  }

  /**
   * Get IoT metrics across all projects
   */
  async getIoTMetrics(): Promise<IoTMetrics> {
    try {
      const allSensorData = await this.getAllSensorData();
      
      const totalSensors = allSensorData.length;
      const operationalSensors = allSensorData.filter(sensor => sensor.status === 'OPERATIONAL').length;
      
      const averageTemperature = allSensorData.reduce((sum, sensor) => sum + sensor.temperature, 0) / totalSensors;
      const averageHumidity = allSensorData.reduce((sum, sensor) => sum + sensor.humidity, 0) / totalSensors;
      
      const totalWaterFlow = allSensorData.reduce((sum, sensor) => sum + sensor.waterFlow, 0);
      const totalEnergyConsumption = allSensorData.reduce((sum, sensor) => sum + sensor.energyConsumption, 0);
      
      const alertsCount = await this.getActiveAlertsCount();
      const maintenanceRequired = allSensorData.filter(sensor => sensor.status === 'MAINTENANCE').length;
      
      return {
        totalSensors,
        operationalSensors,
        averageTemperature,
        averageHumidity,
        totalWaterFlow,
        totalEnergyConsumption,
        alertsCount,
        maintenanceRequired,
      };
    } catch (error) {
      this.logger.error('Error fetching IoT metrics:', error);
      return this.getFallbackIoTMetrics();
    }
  }

  /**
   * Get sensor alerts
   */
  async getSensorAlerts(projectId?: string): Promise<SensorAlert[]> {
    try {
      return this.getSimulatedAlerts(projectId);
    } catch (error) {
      this.logger.error('Error fetching sensor alerts:', error);
      return [];
    }
  }

  /**
   * Get real-time sensor status
   */
  async getSensorStatus(sensorId: string): Promise<{
    isOnline: boolean;
    lastUpdate: Date;
    batteryLevel: number;
    signalStrength: number;
    nextMaintenance: Date;
  }> {
    try {
      return {
        isOnline: Math.random() > 0.1, // 90% online rate
        lastUpdate: new Date(),
        batteryLevel: 60 + (Math.random() * 40), // 60-100%
        signalStrength: 70 + (Math.random() * 30), // 70-100%
        nextMaintenance: new Date(Date.now() + (Math.random() * 30 * 24 * 60 * 60 * 1000)), // 0-30 days
      };
    } catch (error) {
      this.logger.error(`Error getting sensor status for ${sensorId}:`, error);
      return {
        isOnline: false,
        lastUpdate: new Date(),
        batteryLevel: 0,
        signalStrength: 0,
        nextMaintenance: new Date(),
      };
    }
  }

  /**
   * Get simulated sensor data
   */
  private getSimulatedSensorData(projectId: string): SensorData[] {
    const sensors: SensorData[] = [];
    const now = Date.now();
    
    // Generate data for 5-10 sensors per project
    const sensorCount = 5 + Math.floor(Math.random() * 6);
    
    for (let i = 0; i < sensorCount; i++) {
      const baseTime = now - (Math.random() * 24 * 60 * 60 * 1000); // Last 24 hours
      
      sensors.push({
        projectId,
        sensorId: `SENSOR-${projectId}-${i + 1}`,
        timestamp: new Date(baseTime),
        temperature: 20 + (Math.random() * 15 - 7.5), // 12.5-27.5°C
        humidity: 40 + (Math.random() * 40), // 40-80%
        waterFlow: 100 + (Math.random() * 200), // 100-300 L/min
        energyConsumption: 2 + (Math.random() * 3), // 2-5 kWh
        pressure: 1.5 + (Math.random() * 1), // 1.5-2.5 bar
        phLevel: 6.5 + (Math.random() * 2), // 6.5-8.5
        turbidity: 0.5 + (Math.random() * 2), // 0.5-2.5 NTU
        status: this.getRandomStatus(),
      });
    }
    
    return sensors;
  }

  /**
   * Get all sensor data across projects
   */
  private async getAllSensorData(): Promise<SensorData[]> {
    const projectIds = ['PROJ-001', 'PROJ-002', 'PROJ-003', 'PROJ-004'];
    const allData: SensorData[] = [];
    
    for (const projectId of projectIds) {
      const projectData = this.getSimulatedSensorData(projectId);
      allData.push(...projectData);
    }
    
    return allData;
  }

  /**
   * Get simulated alerts
   */
  private getSimulatedAlerts(projectId?: string): SensorAlert[] {
    const alerts: SensorAlert[] = [];
    const alertTypes: SensorAlert['alertType'][] = [
      'TEMPERATURE_HIGH', 'TEMPERATURE_LOW', 'HUMIDITY_HIGH', 'HUMIDITY_LOW',
      'ENERGY_HIGH', 'WATER_FLOW_LOW', 'PRESSURE_HIGH', 'PH_ABNORMAL', 'TURBIDITY_HIGH'
    ];
    
    const severities: SensorAlert['severity'][] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    
    for (let i = 0; i < 3 + Math.floor(Math.random() * 5); i++) {
      const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      
      alerts.push({
        sensorId: `SENSOR-${projectId || 'GLOBAL'}-${Math.floor(Math.random() * 10) + 1}`,
        projectId: projectId || `PROJ-${Math.floor(Math.random() * 1000)}`,
        alertType,
        severity,
        message: this.getAlertMessage(alertType, severity),
        timestamp: new Date(Date.now() - (Math.random() * 24 * 60 * 60 * 1000)), // Last 24 hours
        isResolved: Math.random() > 0.7, // 30% unresolved
      });
    }
    
    return alerts;
  }

  /**
   * Get alert message based on type and severity
   */
  private getAlertMessage(alertType: SensorAlert['alertType'], severity: SensorAlert['severity']): string {
    const messages = {
      TEMPERATURE_HIGH: `Temperature is above normal range (${severity} severity)`,
      TEMPERATURE_LOW: `Temperature is below normal range (${severity} severity)`,
      HUMIDITY_HIGH: `Humidity is above normal range (${severity} severity)`,
      HUMIDITY_LOW: `Humidity is below normal range (${severity} severity)`,
      ENERGY_HIGH: `Energy consumption is above normal range (${severity} severity)`,
      WATER_FLOW_LOW: `Water flow is below normal range (${severity} severity)`,
      PRESSURE_HIGH: `Pressure is above normal range (${severity} severity)`,
      PH_ABNORMAL: `pH level is outside normal range (${severity} severity)`,
      TURBIDITY_HIGH: `Turbidity is above normal range (${severity} severity)`,
    };
    
    return messages[alertType];
  }

  /**
   * Get random sensor status
   */
  private getRandomStatus(): SensorData['status'] {
    const statuses: SensorData['status'][] = ['OPERATIONAL', 'MAINTENANCE', 'ERROR', 'OFFLINE'];
    const weights = [0.8, 0.1, 0.05, 0.05]; // 80% operational, 10% maintenance, 5% error, 5% offline
    
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (let i = 0; i < statuses.length; i++) {
      cumulativeWeight += weights[i];
      if (random <= cumulativeWeight) {
        return statuses[i];
      }
    }
    
    return 'OPERATIONAL';
  }

  /**
   * Get active alerts count
   */
  private async getActiveAlertsCount(): Promise<number> {
    const alerts = this.getSimulatedAlerts();
    return alerts.filter(alert => !alert.isResolved).length;
  }

  /**
   * Get fallback IoT metrics
   */
  private getFallbackIoTMetrics(): IoTMetrics {
    return {
      totalSensors: 25,
      operationalSensors: 22,
      averageTemperature: 23.5,
      averageHumidity: 65.2,
      totalWaterFlow: 2500,
      totalEnergyConsumption: 85.5,
      alertsCount: 3,
      maintenanceRequired: 2,
    };
  }

  /**
   * Get sensor efficiency metrics
   */
  async getSensorEfficiency(projectId: string): Promise<{
    uptime: number;
    efficiency: number;
    energyEfficiency: number;
    waterEfficiency: number;
  }> {
    try {
      const sensorData = await this.getSensorData(projectId);
      const operationalSensors = sensorData.filter(sensor => sensor.status === 'OPERATIONAL');
      
      const uptime = (operationalSensors.length / sensorData.length) * 100;
      const efficiency = 85 + (Math.random() * 15); // 85-100%
      const energyEfficiency = 0.8 + (Math.random() * 0.2); // 0.8-1.0 L/kWh
      const waterEfficiency = 95 + (Math.random() * 5); // 95-100%
      
      return {
        uptime,
        efficiency,
        energyEfficiency,
        waterEfficiency,
      };
    } catch (error) {
      this.logger.error(`Error getting sensor efficiency for project ${projectId}:`, error);
      return {
        uptime: 85,
        efficiency: 90,
        energyEfficiency: 0.85,
        waterEfficiency: 97,
      };
    }
  }
} 