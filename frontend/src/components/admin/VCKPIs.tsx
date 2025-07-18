'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';

interface InvestorMetrics {
  totalInvestors: number;
  newInvestorsThisMonth: number;
  investorGrowthRate: number;
  averageInvestmentPerInvestor: number;
}

interface InvestmentMetrics {
  totalInvestments: number;
  newInvestmentsThisMonth: number;
  totalInvestmentAmount: number;
  newInvestmentAmountThisMonth: number;
  investmentGrowthRate: number;
}

interface ProjectMetrics {
  operationalProjects: number;
  seekingFundingProjects: number;
  totalProjects: number;
  projectSuccessRate: number;
}

interface PlatformMetrics {
  totalValueLocked: number;
  monthlyGrowthRate: number;
  averageROI: number;
  platformUptime: number;
}

interface VCKPIsData {
  investorMetrics: InvestorMetrics;
  investmentMetrics: InvestmentMetrics;
  projectMetrics: ProjectMetrics;
  platformMetrics: PlatformMetrics;
}

const VCKPIs: React.FC = () => {
  const [data, setData] = useState<VCKPIsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/admin/analytics/vc-kpis');
        setData(response.data);
      } catch (err) {
        setError('Failed to load VC KPIs');
        console.error('Error fetching VC KPIs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (!data) return null;



  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatGrowth = (growth: number) => {
    const color = growth >= 0 ? 'text-green-600' : 'text-red-600';
    const sign = growth >= 0 ? '+' : '';
    return <span className={color}>{sign}{growth.toFixed(1)}%</span>;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">VC-Focused KPIs</h2>
        <p className="text-emerald-100">Key performance indicators for investor presentations</p>
      </div>

      {/* Investor Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Investors</p>
              <p className="text-2xl font-bold text-gray-900">{data.investorMetrics.totalInvestors}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">Growth Rate</p>
            <p className="text-sm font-medium">{formatGrowth(data.investorMetrics.investorGrowthRate)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Investments</p>
              <p className="text-2xl font-bold text-gray-900">{data.investmentMetrics.totalInvestments}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">Total Value</p>
            <p className="text-sm font-medium">{formatCurrency(data.investmentMetrics.totalInvestmentAmount)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Project Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{data.projectMetrics.projectSuccessRate.toFixed(1)}%</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">Operational Projects</p>
            <p className="text-sm font-medium">{data.projectMetrics.operationalProjects}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average ROI</p>
              <p className="text-2xl font-bold text-gray-900">{data.platformMetrics.averageROI}%</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">Platform Uptime</p>
            <p className="text-sm font-medium">{data.platformMetrics.platformUptime}%</p>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investor Growth */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Investor Growth</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Investors</span>
              <span className="font-semibold text-gray-900">{data.investorMetrics.totalInvestors}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New This Month</span>
              <span className="font-semibold text-green-600">+{data.investorMetrics.newInvestorsThisMonth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Growth Rate</span>
              <span className="font-semibold">{formatGrowth(data.investorMetrics.investorGrowthRate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Investment</span>
              <span className="font-semibold text-gray-900">{formatCurrency(data.investorMetrics.averageInvestmentPerInvestor)}</span>
            </div>
          </div>
        </div>

        {/* Investment Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Activity</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Investments</span>
              <span className="font-semibold text-gray-900">{data.investmentMetrics.totalInvestments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New This Month</span>
              <span className="font-semibold text-green-600">+{data.investmentMetrics.newInvestmentsThisMonth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Value</span>
              <span className="font-semibold text-gray-900">{formatCurrency(data.investmentMetrics.totalInvestmentAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Growth Rate</span>
              <span className="font-semibold">{formatGrowth(data.investmentMetrics.investmentGrowthRate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Performance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatCurrency(data.platformMetrics.totalValueLocked)}
            </div>
            <div className="text-sm text-gray-600">Total Value Locked</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatGrowth(data.platformMetrics.monthlyGrowthRate)}
            </div>
            <div className="text-sm text-gray-600">Monthly Growth Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {data.platformMetrics.averageROI}%
            </div>
            <div className="text-sm text-gray-600">Average ROI</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {data.platformMetrics.platformUptime}%
            </div>
            <div className="text-sm text-gray-600">Platform Uptime</div>
          </div>
        </div>
      </div>

      {/* Project Portfolio */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Portfolio</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {data.projectMetrics.operationalProjects}
            </div>
            <div className="text-sm text-gray-600">Operational Projects</div>
            <div className="text-xs text-green-600 mt-1">Active & Profitable</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {data.projectMetrics.seekingFundingProjects}
            </div>
            <div className="text-sm text-gray-600">Seeking Funding</div>
            <div className="text-xs text-blue-600 mt-1">Growth Pipeline</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {data.projectMetrics.projectSuccessRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
            <div className="text-xs text-purple-600 mt-1">Industry Leading</div>
          </div>
        </div>
      </div>

      {/* VC Presentation Highlights */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">VC Presentation Highlights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Strong investor growth with {data.investorMetrics.investorGrowthRate.toFixed(1)}% monthly increase</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">High project success rate of {data.projectMetrics.projectSuccessRate.toFixed(1)}%</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Industry-leading {data.platformMetrics.averageROI}% average ROI</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Total value locked: {formatCurrency(data.platformMetrics.totalValueLocked)}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Platform uptime: {data.platformMetrics.platformUptime}%</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Monthly growth rate: {data.platformMetrics.monthlyGrowthRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VCKPIs; 