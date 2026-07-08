'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface HealthData {
  projectId: string;
  projectName: string;
  location: string;
  operator: {
    firstName: string;
    lastName: string;
    email: string;
  };
  uptimePercentage: number;
  targetUptime: number;
  avgEfficiency: number;
  expectedEfficiency: number;
  avgWaterProduction: number;
  hasEfficiencyAlert: boolean;
  efficiencyDeviation: number;
  lastUpdated: Date;
  status: string;
}

interface OperationalHealthData {
  overallUptime: number;
  alertsCount: number;
  totalOperationalProjects: number;
  projectsHealth: HealthData[];
}

interface OperationalHealthProps {
  className?: string;
}

export default function OperationalHealth({ className = '' }: OperationalHealthProps) {
  const [healthData, setHealthData] = useState<OperationalHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<HealthData | null>(null);
  const [maintenanceLog, setMaintenanceLog] = useState('');
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  useEffect(() => {
    fetchOperationalHealthData();
  }, []);

  const fetchOperationalHealthData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/admin/analytics/operational-health');
      setHealthData(response.data);
    } catch (err) {
      setError('Error loading operational health data');
      console.error('Error fetching operational health data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'success';
      case 'NEEDS_ATTENTION':
        return 'warning';
      default:
        return 'error';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'Saludable';
      case 'NEEDS_ATTENTION':
        return 'Necesita Atención';
      default:
        return status;
    }
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 90) return 'text-success';
    if (uptime >= 80) return 'text-warning';
    return 'text-danger';
  };

  const getEfficiencyColor = (efficiency: number, expected: number) => {
    const deviation = Math.abs(efficiency - expected) / expected;
    if (deviation <= 0.1) return 'text-success';
    if (deviation <= 0.2) return 'text-warning';
    return 'text-danger';
  };

  const addMaintenanceLog = () => {
    if (!selectedProject || !maintenanceLog.trim()) return;
    
    // In a real implementation, this would save to the database
    console.log(`Maintenance log for ${selectedProject.projectName}: ${maintenanceLog}`);
    setMaintenanceLog('');
    setShowMaintenanceModal(false);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading operational health data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <p className="text-danger mb-4">{error}</p>
          <Button onClick={fetchOperationalHealthData}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
                 <div>
           <h2 className="text-3xl font-bold text-text-primary mb-2">Operational Health Monitoring</h2>
           <p className="text-text-secondary">Real-time tracking of machine performance</p>
         </div>
        
        <div className="flex space-x-2">
                   <Button onClick={() => exportReport('operational')} variant="outline">
           Export Report
         </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className={`text-3xl font-bold mb-2 ${getUptimeColor(healthData?.overallUptime || 0)}`}>
            {(healthData?.overallUptime || 0).toFixed(1)}%
          </div>
                     <div className="text-sm text-text-secondary">Overall Uptime</div>
         </Card>

         <Card className="p-4 text-center">
           <div className="text-3xl font-bold text-danger mb-2">
             {healthData?.alertsCount || 0}
           </div>
           <div className="text-sm text-text-secondary">Active Alerts</div>
         </Card>

         <Card className="p-4 text-center">
           <div className="text-3xl font-bold text-brand-primary mb-2">
             {healthData?.totalOperationalProjects || 0}
           </div>
           <div className="text-sm text-text-secondary">Operational Projects</div>
         </Card>

         <Card className="p-4 text-center">
           <div className="text-3xl font-bold text-success mb-2">
             {healthData?.projectsHealth.filter(p => p.status === 'HEALTHY').length || 0}
           </div>
           <div className="text-sm text-text-secondary">Healthy Machines</div>
        </Card>
      </div>

      {/* Projects Health Table */}
      <Card className="p-6">
                 <h3 className="text-xl font-bold text-text-primary mb-4">Project Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                                 <th className="text-left py-2 text-text-secondary">Project</th>
                 <th className="text-left py-2 text-text-secondary">Operator</th>
                 <th className="text-center py-2 text-text-secondary">Uptime</th>
                 <th className="text-center py-2 text-text-secondary">Efficiency</th>
                 <th className="text-center py-2 text-text-secondary">Production</th>
                 <th className="text-center py-2 text-text-secondary">Status</th>
                 <th className="text-center py-2 text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {healthData?.projectsHealth.map((project, index) => (
                <tr key={index} className="border-b border-border hover:bg-surface-muted">
                  <td className="py-3 text-text-primary">
                    <div>
                      <div className="font-medium">{project.projectName}</div>
                      <div className="text-xs text-text-secondary">{project.location}</div>
                    </div>
                  </td>
                  <td className="py-3 text-text-primary">
                    <div>
                      <div className="font-medium">
                        {project.operator.firstName} {project.operator.lastName}
                      </div>
                      <div className="text-xs text-text-secondary">{project.operator.email}</div>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <div className={`font-bold ${getUptimeColor(project.uptimePercentage)}`}>
                      {project.uptimePercentage.toFixed(1)}%
                    </div>
                                         <div className="text-xs text-text-secondary">Target: {project.targetUptime}%</div>
                  </td>
                  <td className="py-3 text-center">
                    <div className={`font-bold ${getEfficiencyColor(project.avgEfficiency, project.expectedEfficiency)}`}>
                      {project.avgEfficiency.toFixed(2)} kWh/L
                    </div>
                    <div className="text-xs text-text-secondary">
                      {project.hasEfficiencyAlert && (
                        <span className="text-danger">Deviation: {project.efficiencyDeviation.toFixed(1)}%</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-center text-text-primary">
                    <div className="font-bold">
                      {project.avgWaterProduction.toFixed(0)} L/día
                    </div>
                                         <div className="text-xs text-text-secondary">Average</div>
                  </td>
                  <td className="py-3 text-center">
                    <Badge variant={getStatusColor(project.status)}>
                      {getStatusText(project.status)}
                    </Badge>
                  </td>
                  <td className="py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedProject(project);
                          setShowMaintenanceModal(true);
                        }}
                      >
                                                 Maintenance
                       </Button>
                       <Button
                         size="sm"
                         variant="outline"
                         onClick={() => setSelectedProject(project)}
                       >
                         Details
                       </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Alerts Section */}
      {healthData && healthData.alertsCount > 0 && (
        <Card className="p-6 border-l-4 border-l-danger">
                     <h3 className="text-xl font-bold text-text-primary mb-4">Active Alerts</h3>
          <div className="space-y-3">
            {healthData.projectsHealth
              .filter(project => project.hasEfficiencyAlert || project.uptimePercentage < 85)
              .map((project, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[var(--danger-bg)] rounded-lg">
                  <div>
                    <div className="font-medium text-text-primary">{project.projectName}</div>
                    <div className="text-sm text-text-secondary">{project.location}</div>
                  </div>
                  <div className="text-right">
                    {project.hasEfficiencyAlert && (
                                             <div className="text-danger text-sm">
                         Efficiency: {project.efficiencyDeviation.toFixed(1)}% out of range
                       </div>
                     )}
                     {project.uptimePercentage < 85 && (
                       <div className="text-danger text-sm">
                         Uptime: {project.uptimePercentage.toFixed(1)}% (Target: 85%)
                       </div>
                     )}
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Project Details Modal */}
      {selectedProject && !showMaintenanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-xl p-6 max-w-2xl w-full mx-4 border border-border">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-text-primary">{selectedProject.projectName}</h3>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-text-primary mb-2">Información del Proyecto</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Ubicación:</span>
                      <span className="text-text-primary">{selectedProject.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Operador:</span>
                      <span className="text-text-primary">
                        {selectedProject.operator.firstName} {selectedProject.operator.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Última Actualización:</span>
                      <span className="text-text-primary">
                        {new Date(selectedProject.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-text-primary mb-2">Métricas de Rendimiento</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Uptime Actual:</span>
                      <span className={`font-bold ${getUptimeColor(selectedProject.uptimePercentage)}`}>
                        {selectedProject.uptimePercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Eficiencia Energética:</span>
                      <span className={`font-bold ${getEfficiencyColor(selectedProject.avgEfficiency, selectedProject.expectedEfficiency)}`}>
                        {selectedProject.avgEfficiency.toFixed(2)} kWh/L
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Producción Diaria:</span>
                      <span className="text-text-primary font-bold">
                        {selectedProject.avgWaterProduction.toFixed(0)} L
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-text-primary mb-2">Análisis de Tendencias</h4>
                  <div className="space-y-3">
                    <div className="bg-surface-muted rounded-lg p-3">
                      <div className="text-sm text-text-secondary mb-1">Uptime vs Meta</div>
                      <div className="w-full bg-border rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            selectedProject.uptimePercentage >= 85 ? 'bg-success' : 'bg-danger'
                          }`}
                          style={{ width: `${Math.min(selectedProject.uptimePercentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-text-secondary mt-1">
                        {selectedProject.uptimePercentage.toFixed(1)}% / 85% objetivo
                      </div>
                    </div>

                    <div className="bg-surface-muted rounded-lg p-3">
                      <div className="text-sm text-text-secondary mb-1">Eficiencia Energética</div>
                      <div className="text-lg font-bold text-text-primary">
                        {selectedProject.avgEfficiency.toFixed(2)} kWh/L
                      </div>
                      <div className="text-xs text-text-secondary">
                        Esperado: {selectedProject.expectedEfficiency} kWh/L
                        {selectedProject.hasEfficiencyAlert && (
                          <span className="text-danger ml-2">Desviación detectada</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-text-primary mb-2">Recomendaciones</h4>
                  <div className="space-y-2 text-sm">
                    {selectedProject.uptimePercentage < 85 && (
                      <div className="text-warning">
                        El uptime está por debajo del objetivo. Considere revisar la máquina.
                      </div>
                    )}
                    {selectedProject.hasEfficiencyAlert && (
                      <div className="text-danger">
                        La eficiencia energética está fuera del rango esperado. Verifique el funcionamiento.
                      </div>
                    )}
                    {selectedProject.uptimePercentage >= 85 && !selectedProject.hasEfficiencyAlert && (
                      <div className="text-success">
                        Todas las métricas están dentro del rango esperado.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Log Modal */}
      {showMaintenanceModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-xl p-6 max-w-md w-full mx-4 border border-border">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-text-primary">Registro de Mantenimiento</h3>
              <button
                onClick={() => setShowMaintenanceModal(false)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Proyecto: {selectedProject.projectName}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Descripción del Mantenimiento
                </label>
                <textarea
                  value={maintenanceLog}
                  onChange={(e) => setMaintenanceLog(e.target.value)}
                  className="w-full h-32 bg-surface border border-border rounded-lg px-3 py-2 text-text-primary resize-none"
                  placeholder="Describa las actividades de mantenimiento realizadas..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowMaintenanceModal(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={addMaintenanceLog}>
                  Guardar Registro
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const exportReport = async (type: string) => {
  try {
    const response = await axios.get(`/api/admin/analytics/export/${type}`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type}_report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error('Error exporting report:', err);
  }
}; 