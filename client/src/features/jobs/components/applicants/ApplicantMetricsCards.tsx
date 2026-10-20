import React from 'react';
import {
  MdPeople,
  MdHourglassEmpty,
  MdTrendingUp,
  MdCheckCircleOutline,
} from 'react-icons/md';
import type { JobApplicationStatsDto } from '@/shared/api/generated/model';

interface ApplicantMetricsCardsProps {
  stats?: JobApplicationStatsDto;
  isLoading: boolean;
}

export const ApplicantMetricsCards: React.FC<ApplicantMetricsCardsProps> = ({
  stats,
  isLoading,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Applicants */}
      <div className="bg-card rounded-2xl border border-border/50 p-4.5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Total Applicants
          </p>
          {isLoading ? (
            <div className="h-8 w-16 bg-muted/60 animate-pulse rounded mt-1" />
          ) : (
            <p className="text-2xl font-bold font-headline text-foreground mt-0.5">
              {stats?.total ?? 0}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <MdPeople className="text-xl" />
        </div>
      </div>

      {/* Pending Review */}
      <div className="bg-card rounded-2xl border border-border/50 p-4.5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Pending Review
          </p>
          {isLoading ? (
            <div className="h-8 w-16 bg-muted/60 animate-pulse rounded mt-1" />
          ) : (
            <p className="text-2xl font-bold font-headline text-foreground mt-0.5">
              {stats?.pending ?? 0}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
          <MdHourglassEmpty className="text-xl" />
        </div>
      </div>

      {/* In Progress */}
      <div className="bg-card rounded-2xl border border-border/50 p-4.5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            In Progress
          </p>
          {isLoading ? (
            <div className="h-8 w-16 bg-muted/60 animate-pulse rounded mt-1" />
          ) : (
            <p className="text-2xl font-bold font-headline text-foreground mt-0.5">
              {stats?.inProgress ?? 0}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
          <MdTrendingUp className="text-xl" />
        </div>
      </div>

      {/* Offers Accepted */}
      <div className="bg-card rounded-2xl border border-border/50 p-4.5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Offers Accepted
          </p>
          {isLoading ? (
            <div className="h-8 w-16 bg-muted/60 animate-pulse rounded mt-1" />
          ) : (
            <p className="text-2xl font-bold font-headline text-foreground mt-0.5">
              {stats?.offersAccepted ?? 0}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
          <MdCheckCircleOutline className="text-xl" />
        </div>
      </div>
    </div>
  );
};
