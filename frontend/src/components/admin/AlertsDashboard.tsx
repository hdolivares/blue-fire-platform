'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { BoltIcon, SignalIcon, LinkIcon, CurrencyDollarIcon, LockClosedIcon, WrenchScrewdriverIcon, ComputerDesktopIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

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
      case 'CRITICAL': return 'bg-danger';
      case 'HIGH': return 'bg-accent';
      case 'MEDIUM': return 'bg-warning';
      case 'LOW': return 'bg-brand-primary';
      default: return 'bg-text-muted';
    }
  };

  const getTypeIcon = (type: Alert['type']) => {
    const cls = 'h-4 w-4';
    switch (type) {
      case 'PERFORMANCE': return <BoltIcon className={cls} />;
      case 'IOT': return <SignalIcon className={cls} />;
      case 'BLOCKCHAIN': return <LinkIcon className={cls} />;
      case 'INVESTMENT': return <CurrencyDollarIcon className={cls} />;
      case 'SECURITY': return <LockClosedIcon className={cls} />;
      case 'MAINTENANCE': return <WrenchScrewdriverIcon className={cls} />;
      case 'SYSTEM': return <ComputerDesktopIcon className={cls} />;
      default: return <MegaphoneIcon className={cls} />;
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--danger-bg)] border border-border rounded-lg p-4">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="bg-gradient-to-r rounded-lg p-6 text-on-brand"
        style={{ '--tw-gradient-from': 'var(--danger)', '--tw-gradient-to': 'var(--accent)', '--tw-gradient-stops': 'var(--tw-gradient-from), var(--tw-gradient-to)' } as React.CSSProperties}
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-on-brand">Alerts & Notifications</h2>
            <p className="text-on-brand/80">Real-time monitoring and alert management</p>
          </div>
          <button
            onClick={createTestAlert}
            className="bg-on-brand/20 hover:bg-on-brand/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Create Test Alert
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface border border-border rounded-lg shadow-md p-6 border-l-4 border-l-danger">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Total Alerts</p>
                <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
              </div>
              <div className="p-2 bg-[var(--danger-bg)] rounded-lg">
                <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg shadow-md p-6 border-l-4 border-l-warning">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Unread</p>
                <p className="text-2xl font-bold text-text-primary">{stats.unread}</p>
              </div>
              <div className="p-2 bg-[var(--warning-bg)] rounded-lg">
                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V4a1 1 0 00-1-1H5a1 1 0 00-1 1v1zM14 5h6V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v1z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg shadow-md p-6 border-l-4 border-l-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Unresolved</p>
                <p className="text-2xl font-bold text-text-primary">{stats.unresolved}</p>
              </div>
              <div className="p-2 bg-accent/15 rounded-lg">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg shadow-md p-6 border-l-4 border-l-success">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Resolved</p>
                <p className="text-2xl font-bold text-text-primary">{stats.total - stats.unresolved}</p>
              </div>
              <div className="p-2 bg-[var(--success-bg)] rounded-lg">
                <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-surface border border-border rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="bg-surface text-text-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
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
            className="bg-surface text-text-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
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
            className="bg-surface text-text-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="false">Unresolved</option>
            <option value="true">Resolved</option>
            <option value="">All</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-surface border border-border rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text-primary">Active Alerts</h3>
        </div>
        <div className="divide-y divide-border">
          {alerts.length === 0 ? (
            <div className="px-6 py-8 text-center text-text-muted">
              <svg className="mx-auto h-12 w-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2">No alerts found</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`px-6 py-4 hover:bg-surface-muted transition-colors cursor-pointer ${
                  !alert.isRead ? 'bg-[var(--info-bg)]' : ''
                }`}
                onClick={() => setSelectedAlert(alert)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`w-3 h-3 rounded-full mt-2 ${getSeverityColor(alert.severity)}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-text-secondary">{getTypeIcon(alert.type)}</span>
                        <h4 className="text-sm font-medium text-text-primary">{alert.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          alert.severity === 'CRITICAL' ? 'bg-[var(--danger-bg)] text-[var(--danger-fg)]' :
                          alert.severity === 'HIGH' ? 'bg-accent/15 text-accent' :
                          alert.severity === 'MEDIUM' ? 'bg-[var(--warning-bg)] text-[var(--warning-fg)]' :
                          'bg-[var(--info-bg)] text-[var(--info-fg)]'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mt-1">{alert.message}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-text-muted">
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
                        className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium"
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
                        className="text-success hover:text-success/80 text-sm font-medium"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">Alert Details</h3>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-text-muted hover:text-text-secondary"
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
                  <h4 className="text-sm font-medium text-text-primary">Title</h4>
                  <p className="text-sm text-text-secondary mt-1">{selectedAlert.title}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text-primary">Message</h4>
                  <p className="text-sm text-text-secondary mt-1">{selectedAlert.message}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-text-primary">Type</h4>
                    <p className="text-sm text-text-secondary mt-1">{selectedAlert.type}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text-primary">Severity</h4>
                    <p className="text-sm text-text-secondary mt-1">{selectedAlert.severity}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text-primary">Created</h4>
                    <p className="text-sm text-text-secondary mt-1">{formatDate(selectedAlert.createdAt)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text-primary">Status</h4>
                    <p className="text-sm text-text-secondary mt-1">
                      {selectedAlert.isResolved ? 'Resolved' : 'Active'}
                    </p>
                  </div>
                </div>
                {selectedAlert.metadata && (
                  <div>
                    <h4 className="text-sm font-medium text-text-primary">Metadata</h4>
                    <pre className="text-sm text-text-secondary mt-1 bg-surface-muted p-2 rounded">
                      {JSON.stringify(selectedAlert.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-2 text-sm font-medium text-text-secondary bg-surface-muted hover:bg-border rounded-lg"
                >
                  Close
                </button>
                {!selectedAlert.isRead && (
                  <button
                    onClick={() => {
                      markAsRead(selectedAlert.id);
                      setSelectedAlert(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-[var(--info-fg)] bg-[var(--info-bg)] hover:opacity-80 rounded-lg"
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
                    className="px-4 py-2 text-sm font-medium text-[var(--success-fg)] bg-[var(--success-bg)] hover:opacity-80 rounded-lg"
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