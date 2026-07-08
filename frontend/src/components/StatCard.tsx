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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="mono-label mb-2">{title}</h3>
          <p className="text-3xl font-bold text-text-primary tabular-nums tracking-tight">{value}</p>
          {trend && (
            <p className={`mt-2 font-mono text-[0.66rem] uppercase tracking-[0.08em] ${trendColor}`}>
              {trend}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg border border-border bg-surface-muted text-brand-primary">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
