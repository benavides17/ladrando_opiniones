import React from 'react';
import { Mic, Headphones, MessageSquare } from 'lucide-react';
import { Button } from './Button';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: 'mic' | 'headphones' | 'comments';
  title: string;
  description: string;
  actionHref?: string;
  actionText?: string;
}

export function EmptyState({
  icon = 'headphones',
  title,
  description,
  actionHref,
  actionText,
}: EmptyStateProps) {
  const icons = {
    mic: <Mic className="w-10 h-10 text-teal-400" />,
    headphones: <Headphones className="w-10 h-10 text-teal-400" />,
    comments: <MessageSquare className="w-10 h-10 text-teal-400" />,
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-deepblue-800/60 rounded-3xl border border-deepblue-600/50 shadow-card max-w-lg mx-auto my-8 backdrop-blur-xl">
      <div className="w-16 h-16 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center mb-4 shadow-glowTeal">
        {icons[icon]}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-petroleo-200 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionHref && actionText && (
        <Link href={actionHref}>
          <Button variant="accent">{actionText}</Button>
        </Link>
      )}
    </div>
  );
}
