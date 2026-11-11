import { Injectable, Inject } from '@nestjs/common';
import {
  ANALYTICS_READ_REPOSITORY,
  type IAnalyticsReadRepository,
} from '@/features/analytics/domain/repositories/analytics-read.repo.interface';
import { PlansService } from '@/features/plans/services/plans.service';
import {
  AnalyticsTimeRange,
  AdminKpiMetricsDto,
  AdminUserGrowthResponseDto,
  AdminRevenueAnalyticsResponseDto,
  AdminRevenuePlanBreakdownDto,
  AdminRecruitmentAnalyticsResponseDto,
  AdminRecruitmentStatusItemDto,
  AdminMachineryAnalyticsResponseDto,
  AdminMachineSupplyDemandItemDto,
} from '../dto/admin-analytics.dto';
import { ApplicationStatus } from '@/features/applications/domain/application-status.enum';
import { SubscriptionStatus } from '@/features/billing/domain/subscription-status.enum';

interface ResolvedDateRange {
  currentStart: Date;
  currentEnd: Date;
  prevStart: Date;
  prevEnd: Date;
  granularity: 'day' | 'week' | 'month';
}

@Injectable()
export class AdminAnalyticsService {
  constructor(
    @Inject(ANALYTICS_READ_REPOSITORY)
    private readonly analyticsRepo: IAnalyticsReadRepository,
    private readonly plansService: PlansService,
  ) {}

  /**
   * Resolves inclusive start and exclusive end dates for current and prior periods.
   */
  private async resolveDateRanges(
    range: AnalyticsTimeRange = AnalyticsTimeRange.THIRTY_DAYS,
  ): Promise<ResolvedDateRange> {
    const currentEnd = new Date();
    let currentStart: Date;
    let granularity: 'day' | 'week' | 'month' = 'day';

    switch (range) {
      case AnalyticsTimeRange.SEVEN_DAYS:
        currentStart = new Date(currentEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
        granularity = 'day';
        break;
      case AnalyticsTimeRange.NINETY_DAYS:
        currentStart = new Date(
          currentEnd.getTime() - 90 * 24 * 60 * 60 * 1000,
        );
        granularity = 'week';
        break;
      case AnalyticsTimeRange.TWELVE_MONTHS:
        currentStart = new Date(
          currentEnd.getTime() - 365 * 24 * 60 * 60 * 1000,
        );
        granularity = 'month';
        break;
      case AnalyticsTimeRange.ALL:
        currentStart = await this.analyticsRepo.getPlatformEarliestRecordDate();
        granularity = 'month';
        break;
      case AnalyticsTimeRange.THIRTY_DAYS:
      default:
        currentStart = new Date(
          currentEnd.getTime() - 30 * 24 * 60 * 60 * 1000,
        );
        granularity = 'day';
        break;
    }

    const durationMs = currentEnd.getTime() - currentStart.getTime();
    const prevEnd = new Date(currentStart.getTime());
    const prevStart = new Date(prevEnd.getTime() - durationMs);

    return {
      currentStart,
      currentEnd,
      prevStart,
      prevEnd,
      granularity,
    };
  }

  /**
   * Safely calculates percentage change between current and previous periods.
   * Returns null if previous is 0 and current > 0 to prevent division by zero or infinite growth claims.
   */
  private calculateDelta(current: number, previous: number): number | null {
    if (previous === 0) {
      return current === 0 ? 0 : null;
    }
    const delta = ((current - previous) / previous) * 100;
    return Number(delta.toFixed(1));
  }

  /**
   * Derives normalized MRR, ARR, and active paying subscription distribution.
   */
  private async calculateRevenueMetrics(): Promise<{
    currentMrr: number;
    currentArr: number;
    currency: string;
    activePaidSubscriptions: number;
    planDistribution: AdminRevenuePlanBreakdownDto[];
  }> {
    const [subscriptions, plans] = await Promise.all([
      this.analyticsRepo.getPlatformActiveSubscriptions(),
      this.plansService.getPlansWithPrices(),
    ]);

    const planMap = new Map(plans.map((p) => [p.id, p]));
    const distributionMap = new Map<
      string,
      { count: number; monthlyRev: number; name: string }
    >();

    let totalMrr = 0;
    let activePaidCount = 0;
    const currency = 'EGP';

    for (const sub of subscriptions) {
      if (sub.status !== SubscriptionStatus.ACTIVE) {
        continue;
      }

      const subAmount = sub.amount;
      const subInterval = sub.billingInterval;
      const subCurrency = sub.currency;

      // Snapshot validation: exclude Free (amount <= 0) and non-platform currency
      if (subAmount <= 0 || subCurrency !== currency) {
        continue;
      }

      activePaidCount++;
      const monthlyAmount = subInterval === 'year' ? subAmount / 12 : subAmount;

      totalMrr += monthlyAmount;

      const planMeta =
        planMap.get(sub.planId) || this.plansService.getPlanById(sub.planId);
      const planName = planMeta?.name ?? sub.planId;

      const existing = distributionMap.get(sub.planId) || {
        count: 0,
        monthlyRev: 0,
        name: planName,
      };
      existing.count += 1;
      existing.monthlyRev += monthlyAmount;
      distributionMap.set(sub.planId, existing);
    }

    const roundedMrr = Math.round(totalMrr);
    const roundedArr = Math.round(totalMrr * 12);

    const planDistribution: AdminRevenuePlanBreakdownDto[] = Array.from(
      distributionMap.entries(),
    ).map(([planId, data]) => ({
      planId,
      planName: data.name,
      subscriberCount: data.count,
      monthlyRevenueContribution: Math.round(data.monthlyRev),
      revenuePercentage:
        roundedMrr > 0
          ? Number(((data.monthlyRev / roundedMrr) * 100).toFixed(1))
          : 0,
    }));

    return {
      currentMrr: roundedMrr,
      currentArr: roundedArr,
      currency,
      activePaidSubscriptions: activePaidCount,
      planDistribution,
    };
  }

  /**
   * Retrieves high-level executive KPI metrics with period-over-period comparison deltas.
   */
  async getOverviewStats(
    range: AnalyticsTimeRange = AnalyticsTimeRange.THIRTY_DAYS,
  ): Promise<AdminKpiMetricsDto> {
    const { currentStart, currentEnd, prevStart, prevEnd } =
      await this.resolveDateRanges(range);

    const [
      revenue,
      totalUsersCount,
      currentUsers,
      prevUsers,
      activeJobsCount,
      currentJobs,
      prevJobs,
      currentApps,
      prevApps,
    ] = await Promise.all([
      this.calculateRevenueMetrics(),
      this.analyticsRepo.getPlatformUserCounts(),
      this.analyticsRepo.getPlatformUserCounts(currentStart, currentEnd),
      this.analyticsRepo.getPlatformUserCounts(prevStart, prevEnd),
      this.analyticsRepo.getPlatformActiveJobCount(),
      this.analyticsRepo.getPlatformJobPostingsCount(currentStart, currentEnd),
      this.analyticsRepo.getPlatformJobPostingsCount(prevStart, prevEnd),
      this.analyticsRepo.getPlatformApplicationStatusDistribution(
        currentStart,
        currentEnd,
      ),
      this.analyticsRepo.getPlatformApplicationStatusDistribution(
        prevStart,
        prevEnd,
      ),
    ]);

    const currentTotalApps = currentApps.reduce((acc, a) => acc + a.count, 0);
    const prevTotalApps = prevApps.reduce((acc, a) => acc + a.count, 0);

    const currentPlacements =
      currentApps.find((a) => a.status === ApplicationStatus.OFFER_ACCEPTED)
        ?.count || 0;
    const prevPlacements =
      prevApps.find((a) => a.status === ApplicationStatus.OFFER_ACCEPTED)
        ?.count || 0;

    return {
      currentMrr: revenue.currentMrr,
      currentArr: revenue.currentArr,
      currency: revenue.currency,
      activePaidSubscriptions: revenue.activePaidSubscriptions,
      totalUsers: totalUsersCount.total,
      newUsersInPeriod: currentUsers.total,
      usersPeriodDelta: this.calculateDelta(
        currentUsers.total,
        prevUsers.total,
      ),
      activeJobs: activeJobsCount,
      newJobsInPeriod: currentJobs,
      jobsPeriodDelta: this.calculateDelta(currentJobs, prevJobs),
      totalApplicationsInPeriod: currentTotalApps,
      applicationsPeriodDelta: this.calculateDelta(
        currentTotalApps,
        prevTotalApps,
      ),
      placementsInPeriod: currentPlacements,
      placementsPeriodDelta: this.calculateDelta(
        currentPlacements,
        prevPlacements,
      ),
    };
  }

  /**
   * Retrieves time-series user growth metrics broken down by Candidates and Employers.
   */
  async getUserGrowthMetrics(
    range: AnalyticsTimeRange = AnalyticsTimeRange.THIRTY_DAYS,
  ): Promise<AdminUserGrowthResponseDto> {
    const { currentStart, currentEnd, prevStart, prevEnd, granularity } =
      await this.resolveDateRanges(range);

    const [points, currentCounts, prevCounts] = await Promise.all([
      this.analyticsRepo.getPlatformUserGrowthTimeSeries(
        currentStart,
        currentEnd,
        granularity,
      ),
      this.analyticsRepo.getPlatformUserCounts(currentStart, currentEnd),
      this.analyticsRepo.getPlatformUserCounts(prevStart, prevEnd),
    ]);

    return {
      range,
      granularity,
      points,
      summary: {
        candidatesNew: currentCounts.candidates,
        employersNew: currentCounts.employers,
        totalNew: currentCounts.total,
        periodDelta: this.calculateDelta(currentCounts.total, prevCounts.total),
      },
    };
  }

  /**
   * Retrieves financial metrics: current MRR, ARR, and plan distribution.
   */
  async getRevenueMetrics(): Promise<AdminRevenueAnalyticsResponseDto> {
    return this.calculateRevenueMetrics();
  }

  /**
   * Retrieves recruitment application status distribution for the selected period.
   */
  async getRecruitmentMetrics(
    range: AnalyticsTimeRange = AnalyticsTimeRange.THIRTY_DAYS,
  ): Promise<AdminRecruitmentAnalyticsResponseDto> {
    const { currentStart, currentEnd } = await this.resolveDateRanges(range);

    const distribution =
      await this.analyticsRepo.getPlatformApplicationStatusDistribution(
        currentStart,
        currentEnd,
      );

    const totalApplications = distribution.reduce(
      (sum, item) => sum + item.count,
      0,
    );

    const statusLabels: Record<string, string> = {
      [ApplicationStatus.PENDING]: 'Pending Review',
      [ApplicationStatus.SHORTLISTED]: 'Shortlisted',
      [ApplicationStatus.INTERVIEW_SCHEDULED]: 'Interview Scheduled',
      [ApplicationStatus.OFFERED]: 'Offer Extended',
      [ApplicationStatus.OFFER_ACCEPTED]: 'Hired / Offer Accepted',
      [ApplicationStatus.OFFER_DECLINED]: 'Offer Declined',
      [ApplicationStatus.REJECTED]: 'Rejected',
      [ApplicationStatus.WITHDRAWN]: 'Withdrawn',
    };

    const statusDistribution: AdminRecruitmentStatusItemDto[] =
      distribution.map((item) => ({
        status: item.status,
        label: statusLabels[item.status] || item.status,
        count: item.count,
        percentage:
          totalApplications > 0
            ? Number(((item.count / totalApplications) * 100).toFixed(1))
            : 0,
      }));

    const placementsCount =
      distribution.find((d) => d.status === ApplicationStatus.OFFER_ACCEPTED)
        ?.count || 0;
    const rejectedCount =
      distribution.find((d) => d.status === ApplicationStatus.REJECTED)
        ?.count || 0;
    const withdrawnCount =
      distribution.find((d) => d.status === ApplicationStatus.WITHDRAWN)
        ?.count || 0;

    return {
      range,
      totalApplications,
      placementsCount,
      rejectedCount,
      withdrawnCount,
      statusDistribution,
    };
  }

  /**
   * Retrieves top industrial machinery in-demand vs skilled worker supply.
   */
  async getMachineryMetrics(): Promise<AdminMachineryAnalyticsResponseDto> {
    const rawMachines =
      await this.analyticsRepo.getPlatformMachinerySupplyAndDemand(10);

    const machines: AdminMachineSupplyDemandItemDto[] = rawMachines.map((m) => {
      let marketStatus: 'SHORTAGE' | 'BALANCED' | 'SURPLUS' = 'BALANCED';

      if (m.supplyToDemandRatio === null) {
        marketStatus = m.distinctWorkersSupply > 0 ? 'SURPLUS' : 'BALANCED';
      } else if (m.supplyToDemandRatio < 1.0) {
        marketStatus = 'SHORTAGE';
      } else if (m.supplyToDemandRatio > 3.0) {
        marketStatus = 'SURPLUS';
      }

      return {
        machineId: m.machineId,
        nameEn: m.nameEn,
        nameAr: m.nameAr,
        categoryEn: m.categoryEn,
        categoryAr: m.categoryAr,
        activeJobsDemand: m.activeJobsDemand,
        distinctWorkersSupply: m.distinctWorkersSupply,
        supplyToDemandRatio: m.supplyToDemandRatio,
        marketStatus,
      };
    });

    return { machines };
  }
}
