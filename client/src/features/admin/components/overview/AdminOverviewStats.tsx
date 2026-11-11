'use client';

import Link from 'next/link';
import {
  MdGroup,
  MdWorkOutline,
  MdWorkspacePremium,
  MdCheckCircle,
  MdRefresh,
  MdAttachMoney,
} from 'react-icons/md';

import { useGetOverviewStats } from '@/shared/api/generated/admin-analytics/admin-analytics';
import { Button } from '@/shared/components/ui/Button';
import { AdminKpiGridSkeleton } from '../shared/AdminKpiCard-skeleton';
import { AdminKpiCard } from '../shared/AdminKpiCard';

export function AdminOverviewStats() {
  const { data, isLoading, isError, refetch, isRefetching } =
    useGetOverviewStats(undefined, {
      query: {
        staleTime: 60 * 2 * 1000,
      },
    });

  const stats = data?.data;

  const statCards = [
    {
      title: 'Current MRR',
      value: `${stats?.currency ?? 'EGP'} ${(stats?.currentMrr ?? 0).toLocaleString()}`,
      icon: <MdAttachMoney className="text-xl" />,
      iconClassName: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
      href: '/dashboard/admin/billing',
      footer: (
        <span className="text-muted-foreground line-clamp-1">
          {stats?.activePaidSubscriptions ?? 0} active paying subscriptions
        </span>
      ),
    },
    {
      title: 'Total Users',
      value: (stats?.totalUsers ?? 0).toLocaleString(),
      delta: stats?.usersPeriodDelta,
      icon: <MdGroup className="text-xl" />,
      iconClassName: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
      href: '/dashboard/admin/users',
      footer: (
        <span className="text-muted-foreground">Registered platform users</span>
      ),
    },
    {
      title: 'Active Jobs',
      value: (stats?.activeJobs ?? 0).toLocaleString(),
      delta: stats?.jobsPeriodDelta,
      icon: <MdWorkOutline className="text-xl" />,
      iconClassName: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
      href: '/dashboard/admin/jobs',
      footer: (
        <span className="text-muted-foreground">
          Live published job postings
        </span>
      ),
    },
    {
      title: 'Hires Placed',
      value: (stats?.placementsInPeriod ?? 0).toLocaleString(),
      delta: stats?.placementsPeriodDelta,
      icon: <MdCheckCircle className="text-xl" />,
      iconClassName: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
      href: '/dashboard/admin/analytics',
      footer: (
        <span className="text-muted-foreground">Offers accepted in period</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-row justify-between ">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Platform Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time aggregate platform statistics and management shortcuts.
          </p>
        </div>

        <div className="flex self-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
            title="Refresh Data"
            className="p-2 group max-h-8"
          >
            <MdRefresh
              className={`text-base text-primary group-hover:rotate-90  ${isRefetching ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </div>

      {isError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          Failed to load overview metrics. Please click refresh to try again.
        </div>
      )}

      {isLoading ? (
        <AdminKpiGridSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <AdminKpiCard key={card.title} {...card} />
          ))}
        </div>
      )}
    </div>
  );
}
