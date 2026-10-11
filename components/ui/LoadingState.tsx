import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function LoadingSpinner({
  className,
  size = 'md',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  return (
    <Loader2
      className={cn('animate-spin text-teal-400', sizes[size], className)}
    />
  );
}

export function AudioCardSkeleton() {
  return (
    <div className="bg-deepblue-800/50 rounded-3xl p-5 border border-deepblue-600/40 shadow-card animate-pulse flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-deepblue-700" />
            <div className="space-y-1.5">
              <div className="w-24 h-3.5 bg-deepblue-700 rounded" />
              <div className="w-16 h-2.5 bg-deepblue-700/60 rounded" />
            </div>
          </div>
          <div className="w-16 h-5 bg-deepblue-700 rounded-full" />
        </div>
        <div className="w-3/4 h-5 bg-deepblue-700 rounded" />
        <div className="w-full h-3 bg-deepblue-700/50 rounded" />
      </div>

      <div className="pt-2 border-t border-deepblue-700/50 flex items-center justify-between">
        <div className="w-28 h-8 bg-deepblue-700 rounded-xl" />
        <div className="w-12 h-4 bg-deepblue-700/60 rounded" />
      </div>
    </div>
  );
}
