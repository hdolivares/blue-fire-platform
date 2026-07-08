'use client';

import React, { useState } from 'react';
import GlobalMapView from '@/components/admin/GlobalMapView';
import FinancialReports from '@/components/admin/FinancialReports';
import OperationalHealth from '@/components/admin/OperationalHealth';
import ExtendedMetrics from '@/components/admin/ExtendedMetrics';
import MonthOverMonthReports from '@/components/admin/MonthOverMonthReports';
import IndustryBenchmarks from '@/components/admin/IndustryBenchmarks';
import VCKPIs from '@/components/admin/VCKPIs';
import BlockchainMetrics from '@/components/admin/BlockchainMetrics';
import { RevenueAnalytics } from '@/components/admin/RevenueAnalytics';
import { SyncControls } from '@/components/admin/SyncControls';

const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('global-map');

  const tabs = [
    { id: 'global-map', name: 'Global Map', component: <GlobalMapView /> },
    { id: 'revenue-analytics', name: 'Revenue Analytics', component: <RevenueAnalytics /> },
    { id: 'sync-controls', name: 'Sync Controls', component: <SyncControls /> },
    { id: 'financial-reports', name: 'Financial Reports', component: <FinancialReports /> },
    { id: 'operational-health', name: 'Operational Health', component: <OperationalHealth /> },
    { id: 'blockchain-metrics', name: 'Blockchain Metrics', component: <BlockchainMetrics /> },
    { id: 'extended-metrics', name: 'Extended Metrics', component: <ExtendedMetrics /> },
    { id: 'month-over-month', name: 'Month-over-Month', component: <MonthOverMonthReports /> },
    { id: 'industry-benchmarks', name: 'Industry Benchmarks', component: <IndustryBenchmarks /> },
    { id: 'vc-kpis', name: 'VC KPIs', component: <VCKPIs /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="kicker mb-2"><b>◇</b> Intelligence</p>
          <h1 className="section-header !mb-2">Analytics dashboard</h1>
          <p className="text-text-secondary">
            Comprehensive analytics and reporting for BlueFire platform performance
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 hairline-b">
          <nav className="flex gap-6 overflow-x-auto pb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
        <div className="bg-surface border border-border rounded-lg shadow">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage; 