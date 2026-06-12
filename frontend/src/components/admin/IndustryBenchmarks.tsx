'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';

interface BenchmarkData {
  blueFire: number;
  industryAverage: number;
  industryTop: number;
}

interface CurrentMetrics {
  totalWaterProduced: number;
  totalEnergyConsumed: number;
  totalRevenue: number;
  averageEfficiency: number;
  operationalProjects: number;
}

interface PerformanceVsIndustry {
  waterProduction: number;
  energyEfficiency: number;
  revenuePerLiter: number;
  uptime: number;
  roi: number;
}

interface IndustryBenchmarksData {
  currentMetrics: CurrentMetrics;
  benchmarks: {
    waterProduction: BenchmarkData;
    energyEfficiency: BenchmarkData;
    revenuePerLiter: BenchmarkData;
    uptime: BenchmarkData;
    roi: BenchmarkData;
  };
  performanceVsIndustry: PerformanceVsIndustry;
}

const IndustryBenchmarks: React.FC = () => {
  const [data, setData] = useState<IndustryBenchmarksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/admin/analytics/industry-benchmarks');
        setData(response.data);
      } catch (err) {
        setError('Failed to load industry benchmarks');
        console.error('Error fetching industry benchmarks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

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

  const formatPercentage = (num: number) => {
    const color = num >= 0 ? 'text-success' : 'text-danger';
    const sign = num >= 0 ? '+' : '';
    return <span className={color}>{sign}{num.toFixed(1)}%</span>;
  };

  const BenchmarkCard = ({ 
    title, 
    blueFireValue, 
    industryAverage, 
    industryTop, 
    unit = '', 
    isPercentage = false,
    isCurrency = false 
  }: {
    title: string;
    blueFireValue: number;
    industryAverage: number;
    industryTop: number;
    unit?: string;
    isPercentage?: boolean;
    isCurrency?: boolean;
  }) => {
    const formatValue = (value: number) => {
      if (isCurrency) return formatCurrency(value);
      if (isPercentage) return `${value.toFixed(1)}%`;
      return `${formatNumber(value)}${unit}`;
    };

    return (
      <div className="bg-surface border border-border rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">{title}</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Blue Fire</span>
            <span className="font-semibold text-brand-primary">{formatValue(blueFireValue)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Industry Average</span>
            <span className="font-semibold text-text-primary">{formatValue(industryAverage)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Industry Top</span>
            <span className="font-semibold text-brand-secondary">{formatValue(industryTop)}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-text-secondary">Performance vs Industry</span>
              <span className={`font-semibold ${blueFireValue > industryAverage ? 'text-success' : 'text-danger'}`}>
                {blueFireValue > industryAverage ? 'Above Average' : 'Below Average'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="gradient-brand rounded-lg p-6 text-on-brand">
        <h2 className="text-2xl font-bold mb-2">Industry Benchmarks</h2>
        <p className="text-on-brand/80">Compare Blue Fire performance against industry standards</p>
      </div>

      {/* Current Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-border rounded-lg shadow-md p-6 border-l-4 border-l-brand-primary">
          <div className="flex items-center">
            <div className="p-2 bg-[var(--info-bg)] rounded-lg">
              <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Water Produced</p>
              <p className="text-2xl font-bold text-text-primary">{formatNumber(data.currentMetrics?.totalWaterProduced || 0)} L</p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg shadow-md p-6 border-l-4 border-l-success">
          <div className="flex items-center">
            <div className="p-2 bg-[var(--success-bg)] rounded-lg">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Total Revenue</p>
              <p className="text-2xl font-bold text-text-primary">{formatCurrency(data.currentMetrics?.totalRevenue || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg shadow-md p-6 border-l-4 border-l-brand-secondary">
          <div className="flex items-center">
            <div className="p-2 bg-[var(--surface-muted)] rounded-lg">
              <svg className="w-6 h-6 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Energy Efficiency</p>
              <p className="text-2xl font-bold text-text-primary">{(data.currentMetrics?.averageEfficiency || 0).toFixed(2)} L/kWh</p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg shadow-md p-6 border-l-4 border-l-accent">
          <div className="flex items-center">
            <div className="p-2 bg-[var(--warning-bg)] rounded-lg">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Operational Projects</p>
              <p className="text-2xl font-bold text-text-primary">{data.currentMetrics?.operationalProjects || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance vs Industry */}
      <div className="bg-surface border border-border rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Performance vs Industry</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {formatPercentage(data.performanceVsIndustry?.waterProduction || 0)}
            </div>
            <div className="text-sm text-text-secondary">Water Production</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {formatPercentage(data.performanceVsIndustry?.energyEfficiency || 0)}
            </div>
            <div className="text-sm text-text-secondary">Energy Efficiency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {formatPercentage(data.performanceVsIndustry?.revenuePerLiter || 0)}
            </div>
            <div className="text-sm text-text-secondary">Revenue per Liter</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {formatPercentage(data.performanceVsIndustry?.uptime || 0)}
            </div>
            <div className="text-sm text-text-secondary">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {formatPercentage(data.performanceVsIndustry?.roi || 0)}
            </div>
            <div className="text-sm text-text-secondary">ROI</div>
          </div>
        </div>
      </div>

      {/* Benchmark Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BenchmarkCard
          title="Water Production"
          blueFireValue={data.benchmarks?.waterProduction?.blueFire || 0}
          industryAverage={data.benchmarks?.waterProduction?.industryAverage || 0}
          industryTop={data.benchmarks?.waterProduction?.industryTop || 0}
          unit=" L"
        />
        
        <BenchmarkCard
          title="Energy Efficiency"
          blueFireValue={data.benchmarks?.energyEfficiency?.blueFire || 0}
          industryAverage={data.benchmarks?.energyEfficiency?.industryAverage || 0}
          industryTop={data.benchmarks?.energyEfficiency?.industryTop || 0}
          unit=" L/kWh"
        />
        
        <BenchmarkCard
          title="Revenue per Liter"
          blueFireValue={data.benchmarks?.revenuePerLiter?.blueFire || 0}
          industryAverage={data.benchmarks?.revenuePerLiter?.industryAverage || 0}
          industryTop={data.benchmarks?.revenuePerLiter?.industryTop || 0}
          isCurrency={true}
        />
        
        <BenchmarkCard
          title="Uptime"
          blueFireValue={data.benchmarks?.uptime?.blueFire || 0}
          industryAverage={data.benchmarks?.uptime?.industryAverage || 0}
          industryTop={data.benchmarks?.uptime?.industryTop || 0}
          isPercentage={true}
        />
        
        <BenchmarkCard
          title="ROI"
          blueFireValue={data.benchmarks?.roi?.blueFire || 0}
          industryAverage={data.benchmarks?.roi?.industryAverage || 0}
          industryTop={data.benchmarks?.roi?.industryTop || 0}
          isPercentage={true}
        />
      </div>

      {/* Competitive Analysis */}
      <div className="bg-surface border border-border rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Competitive Analysis</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[var(--info-bg)] rounded-lg">
            <div>
              <h4 className="font-medium text-text-primary">Market Position</h4>
              <p className="text-sm text-text-secondary">Blue Fire&apos;s position relative to industry leaders</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-brand-primary">Top 20%</div>
              <div className="text-sm text-text-muted">Industry Ranking</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-[var(--success-bg)] rounded-lg">
            <div>
              <h4 className="font-medium text-text-primary">Efficiency Advantage</h4>
              <p className="text-sm text-text-secondary">Energy efficiency compared to industry average</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-success">+15%</div>
              <div className="text-sm text-text-muted">Above Average</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-[var(--surface-muted)] rounded-lg">
            <div>
              <h4 className="font-medium text-text-primary">Revenue Performance</h4>
              <p className="text-sm text-text-secondary">Revenue per liter vs industry standards</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-brand-secondary">+25%</div>
              <div className="text-sm text-text-muted">Above Average</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustryBenchmarks; 