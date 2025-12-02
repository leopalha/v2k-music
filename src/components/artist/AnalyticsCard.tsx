'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: number; // percentage
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  subtitle?: string;
}

export default function AnalyticsCard({
  title,
  value,
  change,
  icon,
  trend,
  subtitle,
}: AnalyticsCardProps) {
  const isPositive = trend === 'up' || (change !== undefined && change >= 0);

  return (
    <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 hover:border-primary/50 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-text-secondary">{title}</span>
        <div className="p-2 bg-primary/10 rounded-lg">
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className="mb-2">
        <p className="text-3xl font-bold text-text-primary">{value}</p>
      </div>

      {/* Change/Subtitle */}
      {change !== undefined ? (
        <div className="flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-accent-green" />
          ) : (
            <TrendingDown className="w-4 h-4 text-accent-red" />
          )}
          <span
            className={`text-sm font-medium ${
              isPositive ? 'text-accent-green' : 'text-accent-red'
            }`}
          >
            {isPositive ? '+' : ''}
            {change.toFixed(1)}%
          </span>
          <span className="text-xs text-text-tertiary ml-1">vs mês anterior</span>
        </div>
      ) : subtitle ? (
        <p className="text-sm text-text-tertiary">{subtitle}</p>
      ) : null}
    </div>
  );
}
