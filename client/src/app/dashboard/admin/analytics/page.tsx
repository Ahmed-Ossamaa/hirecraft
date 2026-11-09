"use client";

import { useState } from "react";
import { MdBarChart } from "react-icons/md";
import { GetOverviewStatsRange } from "@/shared/api/generated/model";
import {
  useGetOverviewStats,
  useGetUserGrowthMetrics,
  useGetRevenueMetrics,
  useGetRecruitmentMetrics,
  useGetMachineryMetrics,
} from "@/shared/api/generated/admin-analytics/admin-analytics";
import { AnalyticsTimeRangeSelector } from "@/features/admin/components/analytics/AnalyticsTimeRangeSelector";
import { AnalyticsKpiGrid } from "@/features/admin/components/analytics/AnalyticsKpiGrid";
import { UserGrowthChart } from "@/features/admin/components/analytics/UserGrowthChart";
import { RevenueAnalyticsCard } from "@/features/admin/components/analytics/RevenueAnalyticsCard";
import { RecruitmentStatusChart } from "@/features/admin/components/analytics/RecruitmentStatusChart";
import { MachineryDemandChart } from "@/features/admin/components/analytics/MachineryDemandChart";

export default function AdminAnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState<GetOverviewStatsRange>(
    GetOverviewStatsRange["30d"],
  );

  const overviewQuery = useGetOverviewStats({
    range: selectedRange,
  });

  const userGrowthQuery = useGetUserGrowthMetrics({
    range: selectedRange,
  });

  const revenueQuery = useGetRevenueMetrics();

  const recruitmentQuery = useGetRecruitmentMetrics({
    range: selectedRange,
  });

  const machineryQuery = useGetMachineryMetrics();

  const isRefreshing =
    overviewQuery.isRefetching ||
    userGrowthQuery.isRefetching ||
    revenueQuery.isRefetching ||
    recruitmentQuery.isRefetching ||
    machineryQuery.isRefetching;

  const handleRefresh = () => {
    overviewQuery.refetch();
    userGrowthQuery.refetch();
    revenueQuery.refetch();
    recruitmentQuery.refetch();
    machineryQuery.refetch();
  };

  const hasError =
    overviewQuery.isError ||
    userGrowthQuery.isError ||
    revenueQuery.isError ||
    recruitmentQuery.isError ||
    machineryQuery.isError;

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MdBarChart className="text-primary text-3xl shrink-0" />
            Platform Analytics Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Executive KPIs, user acquisition velocity, recurring subscription
            health, and machinery marketplace liquidity.
          </p>
        </div>

        <AnalyticsTimeRangeSelector
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      </div>

      {hasError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center justify-between">
          <span>
            Failed to load some analytics data. Please check your connection and
            click refresh.
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            className="font-medium underline hover:opacity-80 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Top-Level Executive KPI Grid */}
      <AnalyticsKpiGrid
        metrics={overviewQuery.data?.data}
        isLoading={overviewQuery.isLoading}
      />

      {/* Primary Visualization: Full-Width User Registration Velocity */}
      <UserGrowthChart
        data={userGrowthQuery.data?.data}
        isLoading={userGrowthQuery.isLoading}
      />

      {/* Analytics Insights Grid: Revenue & Recruitment (Left) vs. Machinery Demand (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Stacked Revenue Health & Recruitment Status */}
        <div className="flex flex-col gap-6">
          <RevenueAnalyticsCard
            data={revenueQuery.data?.data}
            isLoading={revenueQuery.isLoading}
          />
          <RecruitmentStatusChart
            data={recruitmentQuery.data?.data}
            isLoading={recruitmentQuery.isLoading}
          />
        </div>

        {/* Right Column: Machinery Demand vs Worker Supply */}
        <MachineryDemandChart
          data={machineryQuery.data?.data}
          isLoading={machineryQuery.isLoading}
        />
      </div>
    </div>
  );
}
