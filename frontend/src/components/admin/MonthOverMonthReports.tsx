'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';

interface MonthlyData {
  month: string;
  newProjects: number;
  waterProduced: number;
  revenue: number;
  energyConsumed: number;
  averageEfficiency: number;
}

interface GrowthMetrics {
  revenueGrowth: number;
  waterProductionGrowth: number;
  projectGrowth: number;
  efficiencyGrowth: number;
}

interface MonthOverMonthData {
  monthlyData: MonthlyData[];
  growthMetrics: GrowthMetrics;
}

const MonthOverMonthReports: React.FC = () => {
  const [data, setData] = useState<MonthOverMonthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [months, setMonths] = useState(6);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/admin/analytics/month-over-month?months=${months}`);
        setData(response.data);
      } catch (err) {
        setError('Failed to load month-over-month data');
        console.error('Error fetching month-over-month data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [months]);

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

  if (!data) return null;

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(1);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatGrowth = (growth: number) => {
    const color = growth >= 0 ? 'text-success' : 'text-danger';
    const sign = growth >= 0 ? '+' : '';
    return <span className={color}>{sign}{growth.toFixed(1)}%</span>;
  };

  return (
    <div className="space-y-6">
      <div className="gradient-brand rounded-lg p-6 text-on-brand">
        <h2 className="text-2xl font-bold mb-2">Month-over-Month Reports</h2>
        <p className="text-on-brand/80">Track growth trends and performance comparisons</p>

        <div className="mt-4">
          <label className="text-sm font-medium text-on-brand/80">Time Period:</label>
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="ml-2 px-3 py-1 bg-surface text-text-primary border border-border rounded"
          >
            <option value={3}>3 Months</option>
            <option value={6}>6 Months</option>
            <option value={12}>12 Months</option>
          </select>
        </div>
      </div>

      {/* Growth Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-border rounded-lg shadow-md p-6 border-l-4 border-l-success">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Revenue Growth</p>
              <p className="text-2xl font-bold text-text-primary">
                {formatGrowth(data.growthMetrics.revenueGrowth)}
              </p>
            </div>
            <div className="p-2 bg-[var(--success-bg)] rounded-lg">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg shadow-md p-6 border-l-4 border-l-brand-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Water Production Growth</p>
              <p className="text-2xl font-bold text-text-primary">
                {formatGrowth(data.growthMetrics.waterProductionGrowth)}
              </p>
            </div>
            <div className="p-2 bg-[var(--info-bg)] rounded-lg">
              <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg shadow-md p-6 border-l-4 border-l-brand-secondary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Project Growth</p>
              <p className="text-2xl font-bold text-text-primary">
                {formatGrowth(data.growthMetrics.projectGrowth)}
              </p>
            </div>
            <div className="p-2 bg-[var(--surface-muted)] rounded-lg">
              <svg className="w-6 h-6 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg shadow-md p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Efficiency Growth</p>
              <p className="text-2xl font-bold text-text-primary">
                {formatGrowth(data.growthMetrics.efficiencyGrowth)}
              </p>
            </div>
            <div className="p-2 bg-[var(--warning-bg)] rounded-lg">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Data Table */}
      <div className="bg-surface border border-border rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text-primary">Monthly Performance Data</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-surface-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  New Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Water Produced (L)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Energy (kWh)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Avg Efficiency
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border">
              {data.monthlyData.map((month, index) => (
                <tr key={month.month} className={index % 2 === 0 ? 'bg-surface' : 'bg-surface-muted'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                    {new Date(month.month + '-01').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                    {month.newProjects}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                    {formatNumber(month.waterProduced)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                    {formatCurrency(month.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                    {formatNumber(month.energyConsumed)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                    {month.averageEfficiency.toFixed(2)} L/kWh
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Revenue Trend</h3>
          <div className="space-y-3">
            {data.monthlyData.map((month, index) => {
              const prevMonth = data.monthlyData[index - 1];
              const growth = prevMonth ? ((month.revenue - prevMonth.revenue) / prevMonth.revenue) * 100 : 0;
              
              return (
                <div key={month.month} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    {new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-text-primary">
                      {formatCurrency(month.revenue)}
                    </span>
                    {index > 0 && (
                      <span className={`text-xs ${growth >= 0 ? 'text-success' : 'text-danger'}`}>
                        {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Water Production Trend</h3>
          <div className="space-y-3">
            {data.monthlyData.map((month, index) => {
              const prevMonth = data.monthlyData[index - 1];
              const growth = prevMonth ? ((month.waterProduced - prevMonth.waterProduced) / prevMonth.waterProduced) * 100 : 0;
              
              return (
                <div key={month.month} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    {new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-text-primary">
                      {formatNumber(month.waterProduced)} L
                    </span>
                    {index > 0 && (
                      <span className={`text-xs ${growth >= 0 ? 'text-success' : 'text-danger'}`}>
                        {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthOverMonthReports; 