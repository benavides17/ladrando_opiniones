import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-deepblue-950 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      // Verde azulado vibrante
      primary:
        'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-petroleo-900 shadow-glowTeal focus:ring-teal-400 font-semibold',
      // Amarillo dorado brillante
      accent:
        'bg-gradient-to-r from-dorado-400 to-dorado-500 hover:from-dorado-300 hover:to-dorado-400 text-deepblue-950 shadow-glowGold focus:ring-dorado-400 font-bold',
      // Menta suave
      secondary:
        'bg-menta-300/15 text-menta-200 border border-menta-300/30 hover:bg-menta-300/25 focus:ring-menta-400',
      // Borde petróleo / teal
      outline:
        'border border-teal-500/40 text-teal-300 hover:bg-teal-500/10 hover:border-teal-400 focus:ring-teal-400',
      // Sutil
      ghost:
        'text-petroleo-700 hover:text-petroleo-900 hover:bg-humo-100 focus:ring-teal-400',
      // Peligro
      danger:
        'bg-rose-600 hover:bg-rose-500 text-white shadow-sm border border-rose-500/30 focus:ring-rose-500',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-2 gap-1.5',
      md: 'text-sm px-4.5 py-2.5 gap-2',
      lg: 'text-base px-6 py-3.5 gap-2.5',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
