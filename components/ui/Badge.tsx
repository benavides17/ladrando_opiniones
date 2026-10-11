import React from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'teal' | 'menta' | 'dorado' | 'petroleo' | 'neutral';
  className?: string;
}

export function Badge({ children, variant = 'menta', className }: BadgeProps) {
  const variants = {
    menta: 'bg-menta-300/15 text-menta-200 border-menta-300/30 shadow-sm',
    teal: 'bg-teal-500/20 text-teal-300 border-teal-500/30 shadow-sm',
    dorado: 'bg-dorado-400/20 text-dorado-300 border-dorado-400/30 shadow-sm',
    petroleo: 'bg-deepblue-700/60 text-petroleo-200 border-deepblue-600/60',
    neutral: 'bg-deepblue-800/80 text-petroleo-300 border-deepblue-600/40',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-sm transition-all',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
