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

const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('global-map');

  const tabs = [
    { id: 'global-map', name: 'Global Map', component: <GlobalMapView /> },
    { id: 'revenue-analytics', name: 'Revenue Analytics', component: <RevenueAnalytics /> },
    { id: 'financial-reports', name: 'Financial Reports', component: <FinancialReports /> },
    { id: 'operational-health', name: 'Operational Health', component: <OperationalHealth /> },
    { id: 'blockchain-metrics', name: 'Blockchain Metrics', component: <BlockchainMetrics /> },
    { id: 'extended-metrics', name: 'Extended Metrics', component: <ExtendedMetrics /> },
    { id: 'month-over-month', name: 'Month-over-Month', component: <MonthOverMonthReports /> },
    { id: 'industry-benchmarks', name: 'Industry Benchmarks', component: <IndustryBenchmarks /> },
    { id: 'vc-kpis', name: 'VC KPIs', component: <VCKPIs /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Comprehensive analytics and reporting for Blue Fire Platform performance
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage; 