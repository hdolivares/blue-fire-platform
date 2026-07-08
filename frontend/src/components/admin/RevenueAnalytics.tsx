'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface RevenueStats {
  totalRevenue: number;
  totalClaims: number;
  avgRevenuePerProject: number;
  activeProjects: number;
  topProject: {
    name: string;
    revenue: number;
  } | null;
}

export const RevenueAnalytics = () => {
  const { projects, userPositions, isConnected } = useWeb3();
  const [revenueStats, setRevenueStats] = useState<RevenueStats>({
    totalRevenue: 0,
    totalClaims: 0,
    avgRevenuePerProject: 0,
    activeProjects: 0,
    topProject: null,
  });
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('30d');

  useEffect(() => {
    calculateRevenueStats();
  }, [projects, userPositions, timeframe]);

  const calculateRevenueStats = () => {
    if (!projects || projects.length === 0) {
      return;
    }

    // Calculate total revenue across all projects
    const totalRevenue = projects.reduce((sum, project) => {
      return sum + parseFloat(project.totalFunded || '0');
    }, 0);

    // Calculate total claimable rewards
    const totalClaimable = userPositions.reduce((sum, position) => {
      return sum + parseFloat(position.pendingRewards || '0');
    }, 0);

    // Find operational projects
    const operationalProjects = projects.filter(p => p.state === 2);

    // Find top revenue project
    const topProject = projects.reduce((top, project) => {
      const projectRevenue = parseFloat(project.totalFunded || '0');
      if (!top || projectRevenue > top.revenue) {
        return {
          name: project.name,
          revenue: projectRevenue,
        };
      }
      return top;
    }, null as { name: string; revenue: number } | null);

    setRevenueStats({
      totalRevenue,
      totalClaims: totalClaimable,
      avgRevenuePerProject: operationalProjects.length > 0 ? totalRevenue / operationalProjects.length : 0,
      activeProjects: operationalProjects.length,
      topProject,
    });
  };

  const formatRbtc = (amount: number) => amount.toFixed(4);
  const formatUsd = (rbtcAmount: number) => (rbtcAmount * 2000).toFixed(2); // Approximate BTC price

  if (!isConnected) {
    return (
      <Card variant="frosted" className="p-6">
        <h2 className="text-xl font-bold mb-4">Revenue Analytics</h2>
        <p className="text-secondary">Connect your wallet to view revenue analytics.</p>
      </Card>
    );
  }

  return (
    <Card variant="frosted" className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Revenue Analytics</h2>
        <div className="flex gap-2">
          {(['7d', '30d', 'all'] as const).map((period) => (
            <Button
              key={period}
              onClick={() => setTimeframe(period)}
              variant={timeframe === period ? 'primary' : 'outline'}
              size="sm"
            >
              {period === 'all' ? 'All Time' : period.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card variant="default" className="p-4 bg-[var(--success-bg)] border border-success/20">
          <p className="text-sm text-secondary mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-success">{formatRbtc(revenueStats.totalRevenue)} RBTC</p>
          <p className="text-xs text-secondary">≈ ${formatUsd(revenueStats.totalRevenue)} USD</p>
        </Card>

        <Card variant="default" className="p-4 bg-[var(--info-bg)] border border-brand-primary/20">
          <p className="text-sm text-secondary mb-1">Pending Claims</p>
          <p className="text-2xl font-bold text-brand-primary">{formatRbtc(revenueStats.totalClaims)} RBTC</p>
          <p className="text-xs text-secondary">≈ ${formatUsd(revenueStats.totalClaims)} USD</p>
        </Card>

        <Card variant="default" className="p-4 bg-surface-muted border border-brand-secondary/20">
          <p className="text-sm text-secondary mb-1">Active Projects</p>
          <p className="text-2xl font-bold text-brand-secondary">{revenueStats.activeProjects}</p>
          <p className="text-xs text-secondary">Operational</p>
        </Card>

        <Card variant="default" className="p-4 bg-surface-muted border border-accent/20">
          <p className="text-sm text-secondary mb-1">Avg Revenue</p>
          <p className="text-2xl font-bold text-accent">{formatRbtc(revenueStats.avgRevenuePerProject)} RBTC</p>
          <p className="text-xs text-secondary">Per Project</p>
        </Card>
      </div>

      {/* Project Performance List */}
      <Card variant="default" className="p-4 bg-surface-muted">
        <h3 className="text-lg font-bold mb-4">Project Performance</h3>
        
        {projects.length === 0 ? (
          <p className="text-secondary text-center py-4">No projects data available</p>
        ) : (
          <div className="space-y-3">
            {projects
              .sort((a, b) => parseFloat(b.totalFunded || '0') - parseFloat(a.totalFunded || '0'))
              .slice(0, 5)
              .map((project, index) => (
                <div key={project.projectId} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-warning text-on-brand' :
                      index === 1 ? 'bg-text-muted text-on-brand' :
                      index === 2 ? 'bg-accent text-on-brand' :
                      'bg-surface-muted text-text-primary'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-xs text-secondary">
                        State: {project.state === 0 ? 'SEEKING_FUNDING' : 
                               project.state === 1 ? 'FUNDED' : 
                               project.state === 2 ? 'OPERATIONAL' : 'CLOSED'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success">{formatRbtc(parseFloat(project.totalFunded || '0'))} RBTC</p>
                    <p className="text-xs text-secondary">≈ ${formatUsd(parseFloat(project.totalFunded || '0'))} USD</p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* Revenue Distribution Info */}
      <Card variant="default" className="mt-4 p-4 bg-[var(--info-bg)] border border-brand-primary/20">
        <h3 className="text-sm font-medium mb-2">Revenue Distribution System</h3>
        <ul className="text-xs text-secondary space-y-1">
          <li>• <strong>Operators</strong> deposit revenue from water sales to project contracts</li>
          <li>• <strong>Revenue</strong> is automatically distributed proportionally to all investors</li>
          <li>• <strong>Investors</strong> can claim their rewards at any time</li>
          <li>• <strong>Claims</strong> are processed immediately via smart contracts</li>
          <li>• <strong>History</strong> is permanently recorded on blockchain</li>
        </ul>
      </Card>
    </Card>
  );
}; 