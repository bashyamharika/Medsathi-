import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn.js';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, leftIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-stone-700 tracking-tight"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-4 text-stone-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full h-12 rounded-2xl bg-white border border-stone-300 text-stone-900 placeholder:text-stone-400 text-base px-4 py-2.5 transition-colors duration-200',
              'focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20',
              'disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed',
              leftIcon && 'pl-11',
              error && 'border-rose-500 focus:border-rose-600 focus:ring-rose-500/20',
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs font-medium text-rose-600">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-stone-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
