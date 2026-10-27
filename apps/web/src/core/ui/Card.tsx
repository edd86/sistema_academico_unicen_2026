import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#e2e8f0] rounded-lg shadow-academic-sm ${className}`}
    >
      {children}
    </div>
  );
};
