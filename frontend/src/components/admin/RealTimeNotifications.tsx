'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { BoltIcon, SignalIcon, LinkIcon, CurrencyDollarIcon, LockClosedIcon, WrenchScrewdriverIcon, ComputerDesktopIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  type: 'PERFORMANCE' | 'IOT' | 'BLOCKCHAIN' | 'INVESTMENT' | 'SECURITY' | 'MAINTENANCE' | 'SYSTEM';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  timestamp: Date;
  isNew: boolean;
}

const RealTimeNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Simulate WebSocket connection for real-time updates
    const connectWebSocket = () => {
      setIsConnected(true);
      
      // Simulate receiving notifications every 10 seconds
      const interval = setInterval(() => {
        const mockNotifications: Notification[] = [
          {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'PERFORMANCE',
            severity: 'MEDIUM',
            title: 'Efficiency Alert',
            message: 'Project efficiency has dropped to 68%',
            timestamp: new Date(),
            isNew: true,
          },
          {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'IOT',
            severity: 'HIGH',
            title: 'Sensor Offline',
            message: 'Temperature sensor SENSOR-002 is offline',
            timestamp: new Date(),
            isNew: true,
          },
          {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'BLOCKCHAIN',
            severity: 'LOW',
            title: 'Transaction Confirmed',
            message: 'Investment transaction confirmed on RSK blockchain',
            timestamp: new Date(),
            isNew: true,
          },
        ];

        // Only add notifications randomly (30% chance)
        if (Math.random() < 0.3) {
          const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
          setNotifications(prev => [randomNotification, ...prev.slice(0, 9)]); // Keep only last 10
          setLastUpdate(new Date());
        }
      }, 10000);

      return () => clearInterval(interval);
    };

    const cleanup = connectWebSocket();
    return cleanup;
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isNew: false } : notif
      )
    );
  };

  const getSeverityColor = (severity: Notification['severity']) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-danger';
      case 'HIGH': return 'bg-accent';
      case 'MEDIUM': return 'bg-warning';
      case 'LOW': return 'bg-brand-primary';
      default: return 'bg-text-muted';
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const newNotificationsCount = notifications.filter(n => n.isNew).length;

  return (
    <div className="bg-surface border border-border rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-text-primary">Real-Time Notifications</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-danger'}`}></div>
              <span className="text-sm text-text-muted">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <div className="text-sm text-text-muted">
            Last update: {formatTime(lastUpdate)}
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-6 py-8 text-center text-text-muted">
            <svg className="mx-auto h-12 w-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V4a1 1 0 00-1-1H5a1 1 0 00-1 1v1zM14 5h6V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v1z" />
            </svg>
            <p className="mt-2">No notifications yet</p>
            <p className="text-xs text-text-muted">Notifications will appear here in real-time</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-6 py-4 hover:bg-surface-muted transition-colors ${
                  notification.isNew ? 'bg-[var(--info-bg)]' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full mt-2 ${getSeverityColor(notification.severity)}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-text-secondary">{getTypeIcon(notification.type)}</span>
                      <h4 className="text-sm font-medium text-text-primary">{notification.title}</h4>
                      {notification.isNew && (
                        <span className="px-2 py-1 text-xs font-medium bg-[var(--info-bg)] text-[var(--info-fg)] rounded-full">
                          NEW
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        notification.severity === 'CRITICAL' ? 'bg-[var(--danger-bg)] text-[var(--danger-fg)]' :
                        notification.severity === 'HIGH' ? 'bg-surface-muted text-accent' :
                        notification.severity === 'MEDIUM' ? 'bg-[var(--warning-bg)] text-[var(--warning-fg)]' :
                        'bg-[var(--info-bg)] text-[var(--info-fg)]'
                      }`}>
                        {notification.severity}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">{notification.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-text-muted">
                        {formatTime(notification.timestamp)}
                      </span>
                      {notification.isNew && (
                        <Button
                          onClick={() => markAsRead(notification.id)}
                          variant="outline"
                          size="sm"
                          className="text-xs text-brand-primary hover:text-brand-primary font-medium"
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {newNotificationsCount > 0 && (
        <div className="px-6 py-3 bg-[var(--info-bg)] border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--info-fg)]">
              {newNotificationsCount} new notification{newNotificationsCount !== 1 ? 's' : ''}
            </span>
            <Button
              onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isNew: false })))}
              variant="outline"
              size="sm"
              className="text-sm text-brand-primary hover:text-brand-primary font-medium"
            >
              Mark all as read
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeNotifications; 