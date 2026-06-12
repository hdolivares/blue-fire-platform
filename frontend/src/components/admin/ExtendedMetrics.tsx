'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';

interface EnvironmentalImpact {
  totalWaterProduced: number;
  carbonFootprintReduction: number;
  energyEfficiency: number;
  totalEnergyConsumed: number;
}

interface SocialImpact {
  totalJobsCreated: number;
  totalCommunitiesServed: number;
  averageJobsPerProject: number;
}

interface OperationalMetrics {
  totalProjects: number;
  averageWaterProduction: number;
  averageEnergyEfficiency: number;
}

interface ExtendedMetricsData {
  environmentalImpact: EnvironmentalImpact;
  socialImpact: SocialImpact;
  operationalMetrics: OperationalMetrics;
}

const ExtendedMetrics: React.FC = () => {
  const [data, setData] = useState<ExtendedMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/admin/analytics/extended-metrics');
        setData(response.data);
      } catch (err) {
        setError('Failed to load extended metrics');
        console.error('Error fetching extended metrics:', err);
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

  if (!data) return null;

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="gradient-brand rounded-lg p-6 text-on-brand">
        <h2 className="text-2xl font-bold mb-2 text-on-brand">Extended Metrics Dashboard</h2>
        <p className="text-on-brand/80">Environmental impact, social metrics, and operational performance</p>
      </div>

      {/* Environmental Impact Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-border rounded-lg shadow-md p-6 border-l-4 border-l-success">
          <div className="flex items-center">
            <div className="p-2 bg-[var(--success-bg)] rounded-lg">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Total Water Produced</p>
              <p className="text-2xl font-bold text-text-primary">{formatNumber(data.environmentalImpact.totalWaterProduced)} L</p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg shadow-md p-6 border-l-4 border-l-brand-primary">
          <div className="flex items-center">
            <div className="p-2 bg-[var(--info-bg)] rounded-lg">
              <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Energy Efficiency</p>
              <p className="text-2xl font-bold text-text-primary">{data.environmentalImpact.energyEfficiency.toFixed(2)} L/kWh</p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg shadow-md p-6 border-l-4 border-l-brand-secondary">
          <div className="flex items-center">
            <div className="p-2 bg-brand-secondary/15 rounded-lg">
              <svg className="w-6 h-6 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">CO2 Reduction</p>
              <p className="text-2xl font-bold text-text-primary">{formatNumber(data.environmentalImpact.carbonFootprintReduction)} kg</p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg shadow-md p-6 border-l-4 border-l-accent">
          <div className="flex items-center">
            <div className="p-2 bg-accent/15 rounded-lg">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Jobs Created</p>
              <p className="text-2xl font-bold text-text-primary">{data.socialImpact.totalJobsCreated}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Impact Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Social Impact</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Communities Served</span>
              <span className="font-semibold text-text-primary">{data.socialImpact.totalCommunitiesServed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Average Jobs per Project</span>
              <span className="font-semibold text-text-primary">{data.socialImpact.averageJobsPerProject.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Total Jobs Created</span>
              <span className="font-semibold text-text-primary">{data.socialImpact.totalJobsCreated}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Operational Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Total Projects</span>
              <span className="font-semibold text-text-primary">{data.operationalMetrics.totalProjects}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Avg Water Production</span>
              <span className="font-semibold text-text-primary">{formatNumber(data.operationalMetrics.averageWaterProduction)} L</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Avg Energy Efficiency</span>
              <span className="font-semibold text-text-primary">{data.operationalMetrics.averageEnergyEfficiency.toFixed(2)} L/kWh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Environmental Impact Details */}
      <div className="bg-surface border border-border rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Environmental Impact Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-success mb-2">
              {formatNumber(data.environmentalImpact.totalWaterProduced)}
            </div>
            <div className="text-sm text-text-secondary">Liters of Clean Water Produced</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-brand-primary mb-2">
              {formatNumber(data.environmentalImpact.totalEnergyConsumed)}
            </div>
            <div className="text-sm text-text-secondary">kWh Energy Consumed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-brand-secondary mb-2">
              {formatNumber(data.environmentalImpact.carbonFootprintReduction)}
            </div>
            <div className="text-sm text-text-secondary">kg CO2 Emissions Reduced</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtendedMetrics; 