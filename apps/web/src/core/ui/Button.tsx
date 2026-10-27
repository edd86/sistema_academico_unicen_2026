import React from 'react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'institutional' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none rounded-md cursor-pointer';

  const sizeStyles = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 text-xs font-semibold tracking-wide',
    lg: 'h-11 px-5 text-sm font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-[#0f172a] text-white hover:bg-[#1e293b] active:bg-[#020617] border border-[#0f172a]',
    secondary:
      'bg-white text-[#0f172a] hover:bg-[#f8fafc] border border-[#e2e8f0]',
    institutional:
      'bg-[#1e3a8a] text-white hover:bg-[#1d4ed8] active:bg-[#172554] border border-[#1e3a8a]',
    destructive:
      'bg-white text-[#dc2626] hover:bg-[#fef2f2] border border-[#fecaca]',
    outline:
      'bg-transparent text-[#334155] hover:bg-[#f1f5f9] border border-[#cbd5e1]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="animate-spin h-3.5 w-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          Cargando...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
