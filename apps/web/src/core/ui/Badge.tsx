import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'active' | 'warning' | 'danger' | 'primary' | 'info';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  const variantStyles = {
    neutral: 'bg-[#f1f5f9] text-[#334155] border-[#e2e8f0]',
    active: 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]',
    warning: 'bg-[#fffbeb] text-[#92400e] border-[#fde68a]',
    danger: 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]',
    primary: 'bg-[#eff6ff] text-[#1e3a8a] border-[#bfdbfe]',
    info: 'bg-[#f0f9ff] text-[#0369a1] border-[#bae6fd]',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase border rounded ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
