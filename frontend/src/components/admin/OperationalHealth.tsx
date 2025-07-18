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
    if (uptime >= 90) return 'text-green-400';
    if (uptime >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getEfficiencyColor = (efficiency: number, expected: number) => {
    const deviation = Math.abs(efficiency - expected) / expected;
    if (deviation <= 0.1) return 'text-green-400';
    if (deviation <= 0.2) return 'text-yellow-400';
    return 'text-red-400';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading operational health data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
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
           <h2 className="text-3xl font-bold text-white mb-2">Operational Health Monitoring</h2>
           <p className="text-gray-300">Real-time tracking of machine performance</p>
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
                     <div className="text-sm text-gray-400">Overall Uptime</div>
         </Card>
         
         <Card className="p-4 text-center">
           <div className="text-3xl font-bold text-red-400 mb-2">
             {healthData?.alertsCount || 0}
           </div>
           <div className="text-sm text-gray-400">Active Alerts</div>
         </Card>
         
         <Card className="p-4 text-center">
           <div className="text-3xl font-bold text-blue-400 mb-2">
             {healthData?.totalOperationalProjects || 0}
           </div>
           <div className="text-sm text-gray-400">Operational Projects</div>
         </Card>
         
         <Card className="p-4 text-center">
           <div className="text-3xl font-bold text-green-400 mb-2">
             {healthData?.projectsHealth.filter(p => p.status === 'HEALTHY').length || 0}
           </div>
           <div className="text-sm text-gray-400">Healthy Machines</div>
        </Card>
      </div>

      {/* Projects Health Table */}
      <Card className="p-6">
                 <h3 className="text-xl font-bold text-white mb-4">Project Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                                 <th className="text-left py-2 text-gray-300">Project</th>
                 <th className="text-left py-2 text-gray-300">Operator</th>
                 <th className="text-center py-2 text-gray-300">Uptime</th>
                 <th className="text-center py-2 text-gray-300">Efficiency</th>
                 <th className="text-center py-2 text-gray-300">Production</th>
                 <th className="text-center py-2 text-gray-300">Status</th>
                 <th className="text-center py-2 text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {healthData?.projectsHealth.map((project, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-3 text-white">
                    <div>
                      <div className="font-medium">{project.projectName}</div>
                      <div className="text-xs text-gray-400">{project.location}</div>
                    </div>
                  </td>
                  <td className="py-3 text-white">
                    <div>
                      <div className="font-medium">
                        {project.operator.firstName} {project.operator.lastName}
                      </div>
                      <div className="text-xs text-gray-400">{project.operator.email}</div>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <div className={`font-bold ${getUptimeColor(project.uptimePercentage)}`}>
                      {project.uptimePercentage.toFixed(1)}%
                    </div>
                                         <div className="text-xs text-gray-400">Target: {project.targetUptime}%</div>
                  </td>
                  <td className="py-3 text-center">
                    <div className={`font-bold ${getEfficiencyColor(project.avgEfficiency, project.expectedEfficiency)}`}>
                      {project.avgEfficiency.toFixed(2)} kWh/L
                    </div>
                    <div className="text-xs text-gray-400">
                      {project.hasEfficiencyAlert && (
                        <span className="text-red-400">⚠️ Deviation: {project.efficiencyDeviation.toFixed(1)}%</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-center text-white">
                    <div className="font-bold">
                      {project.avgWaterProduction.toFixed(0)} L/día
                    </div>
                                         <div className="text-xs text-gray-400">Average</div>
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
        <Card className="p-6 border-l-4 border-red-500">
                     <h3 className="text-xl font-bold text-white mb-4">⚠️ Active Alerts</h3>
          <div className="space-y-3">
            {healthData.projectsHealth
              .filter(project => project.hasEfficiencyAlert || project.uptimePercentage < 85)
              .map((project, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg">
                  <div>
                    <div className="font-medium text-white">{project.projectName}</div>
                    <div className="text-sm text-gray-400">{project.location}</div>
                  </div>
                  <div className="text-right">
                    {project.hasEfficiencyAlert && (
                                             <div className="text-red-400 text-sm">
                         ⚠️ Efficiency: {project.efficiencyDeviation.toFixed(1)}% out of range
                       </div>
                     )}
                     {project.uptimePercentage < 85 && (
                       <div className="text-red-400 text-sm">
                         ⚠️ Uptime: {project.uptimePercentage.toFixed(1)}% (Target: 85%)
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
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full mx-4 border border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">{selectedProject.projectName}</h3>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Información del Proyecto</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ubicación:</span>
                      <span className="text-white">{selectedProject.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Operador:</span>
                      <span className="text-white">
                        {selectedProject.operator.firstName} {selectedProject.operator.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Última Actualización:</span>
                      <span className="text-white">
                        {new Date(selectedProject.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Métricas de Rendimiento</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Uptime Actual:</span>
                      <span className={`font-bold ${getUptimeColor(selectedProject.uptimePercentage)}`}>
                        {selectedProject.uptimePercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Eficiencia Energética:</span>
                      <span className={`font-bold ${getEfficiencyColor(selectedProject.avgEfficiency, selectedProject.expectedEfficiency)}`}>
                        {selectedProject.avgEfficiency.toFixed(2)} kWh/L
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Producción Diaria:</span>
                      <span className="text-white font-bold">
                        {selectedProject.avgWaterProduction.toFixed(0)} L
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Análisis de Tendencias</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="text-sm text-gray-400 mb-1">Uptime vs Meta</div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            selectedProject.uptimePercentage >= 85 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(selectedProject.uptimePercentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {selectedProject.uptimePercentage.toFixed(1)}% / 85% objetivo
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="text-sm text-gray-400 mb-1">Eficiencia Energética</div>
                      <div className="text-lg font-bold text-white">
                        {selectedProject.avgEfficiency.toFixed(2)} kWh/L
                      </div>
                      <div className="text-xs text-gray-400">
                        Esperado: {selectedProject.expectedEfficiency} kWh/L
                        {selectedProject.hasEfficiencyAlert && (
                          <span className="text-red-400 ml-2">⚠️ Desviación detectada</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Recomendaciones</h4>
                  <div className="space-y-2 text-sm">
                    {selectedProject.uptimePercentage < 85 && (
                      <div className="text-yellow-400">
                        ⚠️ El uptime está por debajo del objetivo. Considere revisar la máquina.
                      </div>
                    )}
                    {selectedProject.hasEfficiencyAlert && (
                      <div className="text-red-400">
                        ⚠️ La eficiencia energética está fuera del rango esperado. Verifique el funcionamiento.
                      </div>
                    )}
                    {selectedProject.uptimePercentage >= 85 && !selectedProject.hasEfficiencyAlert && (
                      <div className="text-green-400">
                        ✅ Todas las métricas están dentro del rango esperado.
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
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">Registro de Mantenimiento</h3>
              <button
                onClick={() => setShowMaintenanceModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Proyecto: {selectedProject.projectName}
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción del Mantenimiento
                </label>
                <textarea
                  value={maintenanceLog}
                  onChange={(e) => setMaintenanceLog(e.target.value)}
                  className="w-full h-32 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white resize-none"
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