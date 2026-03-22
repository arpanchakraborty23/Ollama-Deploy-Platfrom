import type { LucideIcon } from 'lucide-react';
import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: string;           // e.g. "+15.5%" or "-10.5%"
  vsLabel?: string;         // e.g. "vs. 14,653 last period"
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = '#2563eb',
  trend,
  vsLabel,
}: StatCardProps) {
  const isPositive = trend?.startsWith('+');
  const isNegative = trend?.startsWith('-');

  return (
    <div className="card p-5 flex flex-col gap-3">
      {/* Top row: label + icon */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </p>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${iconColor}15` }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
      </div>

      {/* Value row */}
      <div className="flex items-end gap-3">
        <h3 className="text-3xl font-bold tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>
          {value}
        </h3>
        {trend && (
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
              isPositive ? 'trend-up' : isNegative ? 'trend-down' : 'trend-neutral'
            }`}
          >
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : isNegative ? <ArrowDownRight className="w-3 h-3" /> : null}
            {trend}
          </span>
        )}
      </div>

      {/* Vs label */}
      {vsLabel && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {vsLabel}
        </p>
      )}

      {/* Bottom accent line */}
      <div
        className="h-0.5 w-full rounded-full mt-auto"
        style={{ background: `${iconColor}20` }}
      />
    </div>
  );
}

export default React.memo(StatCard);
