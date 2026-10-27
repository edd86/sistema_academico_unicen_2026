import React from 'react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  badge?: React.ReactNode;
  accentColor?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  badge,
  accentColor = '#1e3a8a',
  icon,
  children,
  className = '',
}) => {
  return (
    <div
      className={`relative bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-academic-sm overflow-hidden ${className}`}
    >
      {/* 2px top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2.5px]"
        style={{ backgroundColor: accentColor }}
      />
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-semibold text-[#64748b] tracking-wider uppercase">
          {label}
        </span>
        {icon && <span className="text-[#64748b]">{icon}</span>}
      </div>

      <div className="mt-2 flex items-baseline justify-between">
        <div className="text-2xl font-bold font-display tabular-nums text-[#0f172a]">
          {value}
        </div>
        {badge}
      </div>

      {subValue && (
        <div className="mt-1 text-xs text-[#64748b] flex items-center gap-1">
          {subValue}
        </div>
      )}

      {children && <div className="mt-3">{children}</div>}
    </div>
  );
};
