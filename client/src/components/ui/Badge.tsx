import React from 'react';
import { cn } from '../../utils/cn.js';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'teal' | 'amber' | 'emerald' | 'stone' | 'blue';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'teal',
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    teal: 'bg-teal-50 text-teal-800 border-teal-200/80',
    amber: 'bg-amber-50 text-amber-900 border-amber-200/80',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    stone: 'bg-stone-100 text-stone-700 border-stone-200',
    blue: 'bg-sky-50 text-sky-800 border-sky-200/80',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-0.5 font-medium rounded-full',
    md: 'text-sm px-3.5 py-1 font-semibold rounded-full',
    lg: 'text-base px-4 py-1.5 font-semibold rounded-full',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border leading-none tracking-wide select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
