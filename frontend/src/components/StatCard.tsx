// In frontend/src/components/StatCard.tsx
import React from 'react';
import { Card } from './ui/Card';

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  /** Optional trend / sublabel, e.g. "▲ 12% this month" */
  trend?: string;
  trendTone?: 'positive' | 'negative' | 'neutral';
}

export const StatCard = ({ title, value, icon, trend, trendTone = 'neutral' }: StatCardProps) => {
  const trendColor =
    trendTone === 'positive'
      ? 'text-success'
      : trendTone === 'negative'
        ? 'text-danger'
        : 'text-text-muted';

  return (
    <Card variant="frosted" hover className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-text-secondary text-sm mb-1">{title}</h3>
          <p className="text-3xl font-bold text-text-primary">{value}</p>
          {trend && <p className={`mt-1 text-xs font-medium ${trendColor}`}>{trend}</p>}
        </div>
        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-muted text-brand-primary">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
