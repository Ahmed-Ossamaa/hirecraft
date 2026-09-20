import React from 'react';
import { cn } from '@/shared/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className={cn("flex items-center gap-2.5 cursor-pointer text-text-secondary select-none", className)}>
        <input
          ref={ref}
          type="checkbox"
          className="rounded bg-surface-input border-surface-border text-brand-cyan focus:ring-0 focus:ring-offset-0"
          {...props}
        />
        <span className="text-xs">{label}</span>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

