'use client';

import React, { useState, useEffect } from 'react';

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
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const newNotificationsCount = notifications.filter(n => n.isNew).length;

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">Real-Time Notifications</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-500">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Last update: {formatTime(lastUpdate)}
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V4a1 1 0 00-1-1H5a1 1 0 00-1 1v1zM14 5h6V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v1z" />
            </svg>
            <p className="mt-2">No notifications yet</p>
            <p className="text-xs text-gray-400">Notifications will appear here in real-time</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                  notification.isNew ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full mt-2 ${getSeverityColor(notification.severity)}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getTypeIcon(notification.type)}</span>
                      <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                      {notification.isNew && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          NEW
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        notification.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        notification.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        notification.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {notification.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {formatTime(notification.timestamp)}
                      </span>
                      {notification.isNew && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Mark as read
                        </button>
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
        <div className="px-6 py-3 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              {newNotificationsCount} new notification{newNotificationsCount !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isNew: false })))}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeNotifications; 