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
    const color = num >= 0 ? 'text-green-600' : 'text-red-600';
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Blue Fire</span>
            <span className="font-semibold text-blue-600">{formatValue(blueFireValue)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Industry Average</span>
            <span className="font-semibold text-gray-900">{formatValue(industryAverage)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Industry Top</span>
            <span className="font-semibold text-purple-600">{formatValue(industryTop)}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Performance vs Industry</span>
              <span className={`font-semibold ${blueFireValue > industryAverage ? 'text-green-600' : 'text-red-600'}`}>
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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Industry Benchmarks</h2>
        <p className="text-purple-100">Compare Blue Fire performance against industry standards</p>
      </div>

      {/* Current Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Water Produced</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.currentMetrics.totalWaterProduced)} L</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.currentMetrics.totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Energy Efficiency</p>
              <p className="text-2xl font-bold text-gray-900">{data.currentMetrics.averageEfficiency.toFixed(2)} L/kWh</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Operational Projects</p>
              <p className="text-2xl font-bold text-gray-900">{data.currentMetrics.operationalProjects}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance vs Industry */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance vs Industry</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {formatPercentage(data.performanceVsIndustry.waterProduction)}
            </div>
            <div className="text-sm text-gray-600">Water Production</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {formatPercentage(data.performanceVsIndustry.energyEfficiency)}
            </div>
            <div className="text-sm text-gray-600">Energy Efficiency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {formatPercentage(data.performanceVsIndustry.revenuePerLiter)}
            </div>
            <div className="text-sm text-gray-600">Revenue per Liter</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {formatPercentage(data.performanceVsIndustry.uptime)}
            </div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {formatPercentage(data.performanceVsIndustry.roi)}
            </div>
            <div className="text-sm text-gray-600">ROI</div>
          </div>
        </div>
      </div>

      {/* Benchmark Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BenchmarkCard
          title="Water Production"
          blueFireValue={data.benchmarks.waterProduction.blueFire}
          industryAverage={data.benchmarks.waterProduction.industryAverage}
          industryTop={data.benchmarks.waterProduction.industryTop}
          unit=" L"
        />
        
        <BenchmarkCard
          title="Energy Efficiency"
          blueFireValue={data.benchmarks.energyEfficiency.blueFire}
          industryAverage={data.benchmarks.energyEfficiency.industryAverage}
          industryTop={data.benchmarks.energyEfficiency.industryTop}
          unit=" L/kWh"
        />
        
        <BenchmarkCard
          title="Revenue per Liter"
          blueFireValue={data.benchmarks.revenuePerLiter.blueFire}
          industryAverage={data.benchmarks.revenuePerLiter.industryAverage}
          industryTop={data.benchmarks.revenuePerLiter.industryTop}
          isCurrency={true}
        />
        
        <BenchmarkCard
          title="Uptime"
          blueFireValue={data.benchmarks.uptime.blueFire}
          industryAverage={data.benchmarks.uptime.industryAverage}
          industryTop={data.benchmarks.uptime.industryTop}
          isPercentage={true}
        />
        
        <BenchmarkCard
          title="ROI"
          blueFireValue={data.benchmarks.roi.blueFire}
          industryAverage={data.benchmarks.roi.industryAverage}
          industryTop={data.benchmarks.roi.industryTop}
          isPercentage={true}
        />
      </div>

      {/* Competitive Analysis */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitive Analysis</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Market Position</h4>
              <p className="text-sm text-gray-600">Blue Fire&apos;s position relative to industry leaders</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">Top 20%</div>
              <div className="text-sm text-gray-500">Industry Ranking</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Efficiency Advantage</h4>
              <p className="text-sm text-gray-600">Energy efficiency compared to industry average</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">+15%</div>
              <div className="text-sm text-gray-500">Above Average</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Revenue Performance</h4>
              <p className="text-sm text-gray-600">Revenue per liter vs industry standards</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-purple-600">+25%</div>
              <div className="text-sm text-gray-500">Above Average</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustryBenchmarks; 