'use client';

import React, { useState } from 'react';
import AlertsDashboard from '@/components/admin/AlertsDashboard';
import RealTimeNotifications from '@/components/admin/RealTimeNotifications';
import AlertSettings from '@/components/admin/AlertSettings';

type TabType = 'dashboard' | 'notifications' | 'settings';

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs = [
    { id: 'dashboard', name: 'Alert Dashboard' },
    { id: 'notifications', name: 'Real-Time Notifications' },
    { id: 'settings', name: 'Alert Settings' },
  ];

  return (
    <main className="container-main">
      <div className="mb-8">
        <p className="kicker mb-2"><b>◇</b> Monitoring</p>
        <h1 className="section-header !mb-2">Alerts &amp; notifications</h1>
        <p className="text-text-secondary">
          Monitor system alerts, configure notification rules, and manage real-time notifications
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 hairline-b">
        <nav className="flex gap-6 overflow-x-auto pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`whitespace-nowrap py-3 px-0.5 border-b-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
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