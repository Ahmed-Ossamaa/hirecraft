import React from 'react';
import { cn } from '@/shared/utils/utils';
import {
  getApplicationStatusColor,
  getApplicationStatusLabel,
  type AnyApplicationStatus,
} from '@/shared/utils/applicationStatus';

export type ApplicationStatus = AnyApplicationStatus;

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export const ApplicationStatusBadge: React.FC<ApplicationStatusBadgeProps> = ({ status, className }) => {
  const label = getApplicationStatusLabel(status);
  const colorClasses = getApplicationStatusColor(status);

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-medium border',
        colorClasses,
        className
      )}
    >
      {label}
    </span>
  );
};
