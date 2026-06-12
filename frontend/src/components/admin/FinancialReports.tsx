'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface TVLData {
  tvl: number;
  projectsCount: number;
}

interface RevenueData {
  totalRevenue: number;
  totalWaterProduced: number;
  operationalProjectsCount: number;
  averageRevenuePerProject: number;
}

interface ROIData {
  totalROI: number;
  averageROI: number;
  totalInvestments: number;
  roiBreakdown: Array<{
    investorId: string;
    investorName: string;
    investorEmail: string;
    projectName: string;
    projectStatus: string;
    investmentAmount: number;
    fundingPercentage: number;
    roi: number;
    projectedReturn: number;
  }>;
}

interface FinancialReportsProps {
  className?: string;
}

export default function FinancialReports({ className = '' }: FinancialReportsProps) {
  const [tvlData, setTvlData] = useState<TVLData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [roiData, setRoiData] = useState<ROIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchFinancialData();
  }, [dateRange.startDate, dateRange.endDate]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [tvlResponse, revenueResponse, roiResponse] = await Promise.all([
        axios.get('/api/admin/analytics/tvl'),
        axios.get('/api/admin/analytics/revenue', {
          params: dateRange.startDate || dateRange.endDate ? dateRange : {}
        }),
        axios.get('/api/admin/analytics/roi')
      ]);

      setTvlData(tvlResponse.data);
      setRevenueData(revenueResponse.data);
      setRoiData(roiResponse.data);
    } catch (err) {
      setError('Error loading financial data');
      console.error('Error fetching financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (type: 'financial' | 'operational' | 'investor') => {
    try {
      const response = await axios.get(`/api/admin/analytics/export/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting report:', err);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading financial reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <p className="text-danger mb-4">{error}</p>
          <Button onClick={fetchFinancialData}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
                 <div>
           <h2 className="text-3xl font-bold text-text-primary mb-2">Financial Reports</h2>
           <p className="text-text-secondary">Detailed analysis of key financial metrics</p>
         </div>
        
                 <div className="flex space-x-2">
           <Button onClick={() => exportReport('financial')} variant="outline">
             Export Financial
           </Button>
           <Button onClick={() => exportReport('investor')} variant="outline">
             Export Investors
           </Button>
         </div>
      </div>

      {/* Date Range Filter */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
                     <div>
             <label className="block text-sm font-medium text-text-secondary mb-1">
               Start Date
             </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="bg-surface border border-border rounded-lg px-3 py-2 text-text-primary"
            />
          </div>
                     <div>
             <label className="block text-sm font-medium text-text-secondary mb-1">
               End Date
             </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="bg-surface border border-border rounded-lg px-3 py-2 text-text-primary"
            />
          </div>
        </div>
      </Card>

      {/* TVL Section */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-text-primary mb-4">Total Value Locked (TVL)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-brand-primary mb-2">
              ${tvlData?.tvl.toLocaleString() || 0}
            </div>
            <div className="text-text-secondary">Total Value Locked</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-success mb-2">
              {tvlData?.projectsCount || 0}
            </div>
            <div className="text-text-secondary">Projects Seeking Funding</div>
          </div>
        </div>
      </Card>

      {/* Revenue Analytics */}
      <Card className="p-6">
                 <h3 className="text-xl font-bold text-text-primary mb-4">Revenue Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-success mb-1">
              ${revenueData?.totalRevenue.toLocaleString() || 0}
            </div>
                       <div className="text-sm text-text-secondary">Total Revenue</div>
         </div>
         <div className="text-center">
           <div className="text-2xl font-bold text-brand-primary mb-1">
             {revenueData?.totalWaterProduced.toLocaleString() || 0}L
           </div>
           <div className="text-sm text-text-secondary">Water Produced</div>
         </div>
         <div className="text-center">
           <div className="text-2xl font-bold text-brand-secondary mb-1">
             {revenueData?.operationalProjectsCount || 0}
           </div>
           <div className="text-sm text-text-secondary">Operational Projects</div>
         </div>
         <div className="text-center">
           <div className="text-2xl font-bold text-warning mb-1">
             ${revenueData?.averageRevenuePerProject.toLocaleString() || 0}
           </div>
           <div className="text-sm text-text-secondary">Average per Project</div>
          </div>
        </div>
      </Card>

      {/* ROI Reports */}
      <Card className="p-6">
                 <h3 className="text-xl font-bold text-text-primary mb-4">ROI Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-success mb-1">
              ${roiData?.totalROI.toLocaleString() || 0}
            </div>
                       <div className="text-sm text-text-secondary">Total ROI</div>
         </div>
         <div className="text-center">
           <div className="text-2xl font-bold text-brand-primary mb-1">
             {((roiData?.averageROI || 0) * 100).toFixed(1)}%
           </div>
           <div className="text-sm text-text-secondary">Average ROI</div>
         </div>
         <div className="text-center">
           <div className="text-2xl font-bold text-brand-secondary mb-1">
             {roiData?.totalInvestments || 0}
           </div>
           <div className="text-sm text-text-secondary">Total Investments</div>
          </div>
        </div>

        {/* ROI Breakdown Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                                 <th className="text-left py-2 text-text-secondary">Investor</th>
                 <th className="text-left py-2 text-text-secondary">Project</th>
                 <th className="text-left py-2 text-text-secondary">Status</th>
                 <th className="text-right py-2 text-text-secondary">Investment</th>
                 <th className="text-right py-2 text-text-secondary">ROI</th>
                 <th className="text-right py-2 text-text-secondary">Projected Return</th>
              </tr>
            </thead>
            <tbody>
              {roiData?.roiBreakdown.map((item, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="py-2 text-text-primary">
                    <div>
                      <div className="font-medium">{item.investorName}</div>
                      <div className="text-xs text-text-secondary">{item.investorEmail}</div>
                    </div>
                  </td>
                  <td className="py-2 text-text-primary">{item.projectName}</td>
                  <td className="py-2">
                    <Badge variant={
                      item.projectStatus === 'OPERATIONAL' ? 'success' :
                      item.projectStatus === 'SEEKING_FUNDING' ? 'warning' : 'info'
                    }>
                      {item.projectStatus}
                    </Badge>
                  </td>
                  <td className="py-2 text-right text-text-primary">
                    ${item.investmentAmount.toLocaleString()}
                  </td>
                  <td className="py-2 text-right text-success">
                    {(item.roi * 100).toFixed(1)}%
                  </td>
                  <td className="py-2 text-right text-brand-primary">
                    ${item.projectedReturn.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-brand-primary mb-1">
            ${((tvlData?.tvl || 0) + (revenueData?.totalRevenue || 0)).toLocaleString()}
          </div>
                     <div className="text-sm text-text-secondary">Total Platform Value</div>
         </Card>

         <Card className="p-4 text-center">
           <div className="text-2xl font-bold text-success mb-1">
             {((roiData?.averageROI || 0) * 100).toFixed(1)}%
           </div>
           <div className="text-sm text-text-secondary">Annual Average ROI</div>
         </Card>

         <Card className="p-4 text-center">
           <div className="text-2xl font-bold text-brand-secondary mb-1">
             ${(revenueData?.totalWaterProduced || 0) * 0.5}
           </div>
           <div className="text-sm text-text-secondary">Value of Water Produced</div>
         </Card>

         <Card className="p-4 text-center">
           <div className="text-2xl font-bold text-warning mb-1">
             {roiData?.totalInvestments || 0}
           </div>
           <div className="text-sm text-text-secondary">Active Investments</div>
        </Card>
      </div>
    </div>
  );
} 