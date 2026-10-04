import React from 'react';
import { Button } from './Button';
import Link from 'next/link';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  iconWrapperClassName?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  iconWrapperClassName = "w-16 h-16 bg-muted text-muted-foreground rounded-2xl flex items-center justify-center mb-4",
  className = "p-12 md:p-16 text-center flex flex-col items-center bg-card rounded-2xl border border-border shadow-sm",
}) => {
  return (
    <div className={className}>
      <div className={iconWrapperClassName}>
        {icon}
      </div>
      <h3 className="text-xl font-headline font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
        {description}
      </p>
      {actionText && (
        actionHref ? (
          <Link href={actionHref}>
            <Button>{actionText}</Button>
          </Link>
        ) : onAction ? (
          <Button onClick={onAction}>{actionText}</Button>
        ) : null
      )}
    </div>
  );
};
