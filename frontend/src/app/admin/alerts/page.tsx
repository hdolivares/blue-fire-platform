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
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                variant={activeTab === tab.id ? 'primary' : 'outline'}
                size="sm"
                className={`border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </Button>
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