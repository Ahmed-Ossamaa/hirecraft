import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type ApplicationStatus = 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED';

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus | string;
  className?: string;
}

export const ApplicationStatusBadge: React.FC<ApplicationStatusBadgeProps> = ({ status, className }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Pending',
          classes: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
        };
      case 'REVIEWING':
        return {
          label: 'Under Review',
          classes: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        };
      case 'ACCEPTED':
        return {
          label: 'Accepted',
          classes: 'bg-green-500/10 text-green-600 border-green-500/20',
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          classes: 'bg-red-500/10 text-red-600 border-red-500/20',
        };
      default:
        return {
          label: status,
          classes: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-medium border',
          config.classes
        ),
        className
      )}
    >
      {config.label}
    </span>
  );
};
