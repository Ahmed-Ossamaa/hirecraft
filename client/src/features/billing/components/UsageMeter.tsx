'use client';

import React from 'react';
import { cn } from '@/shared/utils/utils';

interface UsageMeterProps {
  label: string;
  used: number;
  max: number;
  unit?: string;
  description?: string;
  icon?: React.ReactNode;
}

export const UsageMeter: React.FC<UsageMeterProps> = ({
  label,
  used,
  max,
  unit = '',
  description,
  icon,
}) => {
  const isUnlimited = max >= 99999;
  const percentage = isUnlimited
    ? 0
    : Math.min(100, Math.max(0, Math.round((used / max) * 100)));

  const isFull = !isUnlimited && used >= max;
  const isWarning = !isUnlimited && !isFull && percentage >= 80;

  return (
    <div className="min-w-0 bg-background/60 rounded-xl border border-border/60 p-4 transition-all hover:border-border">
      <div className="mb-2 space-y-1.5">
        <div className="flex min-w-0 items-start gap-2">
          {icon && (
            <span className="shrink-0 text-muted-foreground text-lg">
              {icon}
            </span>
          )}
          <span className="min-w-0  text-sm font-medium text-foreground">
            {label}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {isFull ? (
              <span className="max-w-full px-2 py-0.5 text-center text-[10px] leading-tight font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 ">
                Limit Reached
              </span>
            ) : isWarning ? (
              <span className="max-w-full px-2 py-0.5 text-center text-[10px] leading-tight font-bold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20  ">
                Near Limit
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex min-w-0 max-w-full flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-sm font-semibold font-mono text-foreground">
              {used}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              / {isUnlimited ? '∞' : max} {unit}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Track */}
      <div className="h-1 w-full bg-border/40 dark:bg-border/60 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out rounded-full',
            isUnlimited
              ? 'bg-primary/40 w-full'
              : isFull
                ? 'bg-rose-500'
                : isWarning
                  ? 'bg-amber-500'
                  : 'bg-primary',
          )}
          style={{ width: isUnlimited ? '100%' : `${percentage}%` }}
        />
      </div>

      {description && (
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};
