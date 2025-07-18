'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';

interface Alert {
  id: string;
  type: 'SYSTEM' | 'PERFORMANCE' | 'SECURITY' | 'MAINTENANCE' | 'INVESTMENT' | 'BLOCKCHAIN' | 'IOT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  projectId?: string;
  sensorId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

interface AlertStats {
  total: number;
  unread: number;
  unresolved: number;
  bySeverity: Record<Alert['severity'], number>;
  byType: Record<Alert['type'], number>;
  recentAlerts: Alert[];
}

const AlertsDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
    isResolved: false,
  });

  useEffect(() => {
    fetchAlerts();
    fetchStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAlerts();
      fetchStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [filters]);

  const fetchAlerts = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.isResolved !== undefined) params.append('isResolved', filters.isResolved.toString());
      
      const response = await axios.get(`/alerts?${params.toString()}`);
      setAlerts(response.data);
    } catch (err) {
      setError('Failed to load alerts');
      console.error('Error fetching alerts:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/alerts/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching alert stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      await axios.patch(`/alerts/${alertId}/read`, { userId: 'admin' });
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      ));
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await axios.patch(`/alerts/${alertId}/resolve`, { resolvedBy: 'admin' });
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, isResolved: true, resolvedAt: new Date() } : alert
      ));
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  };

  const createTestAlert = async () => {
    try {
      await axios.post('/alerts/test');
      fetchAlerts();
      fetchStats();
    } catch (err) {
      console.error('Error creating test alert:', err);
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: Alert['type']) => {
    switch (type) {
      case 'PERFORMANCE': return '⚡';
      case 'IOT': return '📡';
      case 'BLOCKCHAIN': return '🔗';
      case 'INVESTMENT': return '💰';
      case 'SECURITY': return '🔒';
      case 'MAINTENANCE': return '🔧';
      case 'SYSTEM': return '🖥️';
      default: return '📢';
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Alerts & Notifications</h2>
            <p className="text-red-100">Real-time monitoring and alert management</p>
          </div>
          <button
            onClick={createTestAlert}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Create Test Alert
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V4a1 1 0 00-1-1H5a1 1 0 00-1 1v1zM14 5h6V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v1z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unresolved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unresolved}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total - stats.unresolved}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="PERFORMANCE">Performance</option>
            <option value="IOT">IoT</option>
            <option value="BLOCKCHAIN">Blockchain</option>
            <option value="INVESTMENT">Investment</option>
            <option value="SECURITY">Security</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="SYSTEM">System</option>
          </select>

          <select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={filters.isResolved.toString()}
            onChange={(e) => setFilters({ ...filters, isResolved: e.target.value === 'true' })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="false">Unresolved</option>
            <option value="true">Resolved</option>
            <option value="">All</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {alerts.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2">No alerts found</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !alert.isRead ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedAlert(alert)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`w-3 h-3 rounded-full mt-2 ${getSeverityColor(alert.severity)}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getTypeIcon(alert.type)}</span>
                        <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          alert.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{formatDate(alert.createdAt)}</span>
                        {alert.projectId && <span>Project: {alert.projectId}</span>}
                        {alert.sensorId && <span>Sensor: {alert.sensorId}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!alert.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(alert.id);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Mark Read
                      </button>
                    )}
                    {!alert.isResolved && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resolveAlert(alert.id);
                        }}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Alert Details</h3>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Title</h4>
                  <p className="text-sm text-gray-600 mt-1">{selectedAlert.title}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Message</h4>
                  <p className="text-sm text-gray-600 mt-1">{selectedAlert.message}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Type</h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedAlert.type}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Severity</h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedAlert.severity}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Created</h4>
                    <p className="text-sm text-gray-600 mt-1">{formatDate(selectedAlert.createdAt)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Status</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedAlert.isResolved ? 'Resolved' : 'Active'}
                    </p>
                  </div>
                </div>
                {selectedAlert.metadata && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Metadata</h4>
                    <pre className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                      {JSON.stringify(selectedAlert.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Close
                </button>
                {!selectedAlert.isRead && (
                  <button
                    onClick={() => {
                      markAsRead(selectedAlert.id);
                      setSelectedAlert(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg"
                  >
                    Mark as Read
                  </button>
                )}
                {!selectedAlert.isResolved && (
                  <button
                    onClick={() => {
                      resolveAlert(selectedAlert.id);
                      setSelectedAlert(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsDashboard; 