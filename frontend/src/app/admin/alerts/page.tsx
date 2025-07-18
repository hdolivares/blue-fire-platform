'use client';

import React, { useState } from 'react';
import AlertsDashboard from '@/components/admin/AlertsDashboard';
import RealTimeNotifications from '@/components/admin/RealTimeNotifications';
import AlertSettings from '@/components/admin/AlertSettings';
import { Button } from '@/components/ui/Button';

type TabType = 'dashboard' | 'notifications' | 'settings';

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs = [
    { id: 'dashboard', name: 'Alert Dashboard', icon: '🚨' },
    { id: 'notifications', name: 'Real-Time Notifications', icon: '📡' },
    { id: 'settings', name: 'Alert Settings', icon: '⚙️' },
  ];

  return (
    <main className="container-main">
      <div className="mb-8">
        <h1 className="section-header">Alerts & Notifications</h1>
        <p className="text-secondary mt-2">
          Monitor system alerts, configure notification rules, and manage real-time notifications
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-white/10">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'dashboard' && <AlertsDashboard />}
        {activeTab === 'notifications' && <RealTimeNotifications />}
        {activeTab === 'settings' && <AlertSettings />}
      </div>
    </main>
  );
} 