import {
  TimeSeriesBucketPoint,
  UserRoleCount,
  SubscriptionBillingSnapshot,
  ApplicationStatusCount,
  MachineryDemandSupplyPoint,
} from '../models/analytics-read.models';

export const ANALYTICS_READ_REPOSITORY = Symbol('IAnalyticsReadRepository');

export interface IAnalyticsReadRepository {
  /**
   * Retrieves user registration time-series buckets between [start, end)
   * grouped by the specified interval ('day', 'week', 'month').
   */
  getPlatformUserGrowthTimeSeries(
    start: Date,
    end: Date,
    interval: 'day' | 'week' | 'month',
  ): Promise<TimeSeriesBucketPoint[]>;

  /**
   * Retrieves total, candidate, and employer user registration counts within [start, end).
   * If start and end are omitted, counts all registered users.
   */
  getPlatformUserCounts(start?: Date, end?: Date): Promise<UserRoleCount>;

  /**
   * Retrieves the current snapshot count of active jobs (defensively checked: status = 'PUBLISHED' AND expires_at > NOW()).
   */
  getPlatformActiveJobCount(): Promise<number>;

  /**
   * Retrieves the count of jobs created within [start, end).
   */
  getPlatformJobPostingsCount(start: Date, end: Date): Promise<number>;

  /**
   * Retrieves billing snapshots for all currently active subscriptions.
   */
  getPlatformActiveSubscriptions(): Promise<SubscriptionBillingSnapshot[]>;

  /**
   * Retrieves counts of job applications grouped by their status within [start, end).
   * If start and end are omitted, counts across all-time applications.
   */
  getPlatformApplicationStatusDistribution(
    start?: Date,
    end?: Date,
  ): Promise<ApplicationStatusCount[]>;

  /**
   * Retrieves top industrial machines sorted by active job demand, comparing
   * demand (published, non-expired jobs) against supply (distinct workers holding the skill).
   */
  getPlatformMachinerySupplyAndDemand(
    limit?: number,
  ): Promise<MachineryDemandSupplyPoint[]>;

  /**
   * Retrieves the earliest recorded platform activity date (from users table),
   * used as the start boundary for All-time calculations.
   */
  getPlatformEarliestRecordDate(): Promise<Date>;
}
