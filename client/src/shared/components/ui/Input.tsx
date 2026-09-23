import React from 'react';
import { cn } from '@/shared/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-input border rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:outline-none transition",
            "text-foreground",
            "placeholder:text-muted-foreground",
            error ? ["border-red-500/50", "focus:ring-red-500/50"] : ["border-border", "focus:border-primary", "focus:ring-primary"],
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-[10px] text-red-400 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

