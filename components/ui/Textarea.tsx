import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-semibold text-petroleo-100"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-petroleo-900 placeholder:text-petroleo-400 transition-all',
            'focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 min-h-[100px] resize-y shadow-inner',
            'disabled:bg-deepblue-950 disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-rose-500/80 focus:ring-rose-400'
              : 'border-deepblue-600/70 hover:border-deepblue-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-teal-300/70">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
