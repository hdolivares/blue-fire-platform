'use client';

import React, { useState } from 'react';
import GlobalMapView from '@/components/admin/GlobalMapView';
import FinancialReports from '@/components/admin/FinancialReports';
import OperationalHealth from '@/components/admin/OperationalHealth';
import ExtendedMetrics from '@/components/admin/ExtendedMetrics';
import MonthOverMonthReports from '@/components/admin/MonthOverMonthReports';
import IndustryBenchmarks from '@/components/admin/IndustryBenchmarks';
import VCKPIs from '@/components/admin/VCKPIs';

const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('global-map');

  const tabs = [
    { id: 'global-map', name: 'Global Map', icon: '🗺️' },
    { id: 'financial', name: 'Financial Reports', icon: '💰' },
    { id: 'operational', name: 'Operational Health', icon: '🏥' },
    { id: 'extended', name: 'Extended Metrics', icon: '📊' },
    { id: 'month-over-month', name: 'Month-over-Month', icon: '📈' },
    { id: 'benchmarks', name: 'Industry Benchmarks', icon: '🏆' },
    { id: 'vc-kpis', name: 'VC KPIs', icon: '🎯' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'global-map':
        return <GlobalMapView />;
      case 'financial':
        return <FinancialReports />;
      case 'operational':
        return <OperationalHealth />;
      case 'extended':
        return <ExtendedMetrics />;
      case 'month-over-month':
        return <MonthOverMonthReports />;
      case 'benchmarks':
        return <IndustryBenchmarks />;
      case 'vc-kpis':
        return <VCKPIs />;
      default:
        return <GlobalMapView />;
    }
  };

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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage; 