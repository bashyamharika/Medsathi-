import React, { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn.js';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

    const variants = {
      primary:
        'bg-teal-700 text-white hover:bg-teal-800 shadow-sm shadow-teal-900/10 active:bg-teal-900',
      secondary:
        'bg-stone-100 text-stone-800 hover:bg-stone-200 border border-stone-200/80 active:bg-stone-300',
      outline:
        'border-2 border-teal-700 text-teal-800 hover:bg-teal-50/80 active:bg-teal-100/60',
      ghost:
        'text-stone-700 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200/70',
      accent:
        'bg-amber-600 text-white hover:bg-amber-700 shadow-sm shadow-amber-900/10 active:bg-amber-800',
    };

    const sizes = {
      sm: 'text-sm h-9 px-3.5 rounded-xl gap-1.5',
      md: 'text-base h-11 px-5 rounded-2xl gap-2',
      lg: 'text-lg h-13 px-6 rounded-2xl gap-2.5 font-semibold tracking-tight',
      xl: 'text-xl h-16 px-8 rounded-3xl gap-3 font-semibold tracking-tight shadow-md',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.015 }}
        whileTap={{ scale: disabled ? 1 : 0.985 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
