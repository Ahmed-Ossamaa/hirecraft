import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
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
      className={twMerge(
        clsx(
          'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-medium border',
          colorClasses
        ),
        className
      )}
    >
      {label}
    </span>
  );
};
