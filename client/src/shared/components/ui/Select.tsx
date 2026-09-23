import React from 'react';
import { cn } from '@/shared/lib/utils';
import { FiChevronDown } from 'react-icons/fi';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "w-full appearance-none bg-input border rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-foreground focus:ring-1 focus:outline-none cursor-pointer transition",
              error ? ["border-red-500/50", "focus:ring-red-500/50"] : ["border-border", "focus:border-primary", "focus:ring-primary"],
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-card text-foreground">
                {opt.label}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-sm" />
        </div>
        {error && (
          <p className="mt-1.5 text-[10px] text-red-400 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

