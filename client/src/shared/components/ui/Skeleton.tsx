import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-card/60 border border-border/40 ${className}`}
      {...props}
    />
  );
};
