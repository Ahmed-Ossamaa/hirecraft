import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '@/features/users/infrastructure/user.orm-entity';
import { CompanyOrmEntity } from '@/features/companies/infrastructure/company.orm-entity';
import { JobOrmEntity } from '@/features/jobs/infrastructure/job.orm-entity';
import { SubscriptionOrmEntity } from '@/features/billing/infrastructure/subscription.orm-entity';
import { JobStatus } from '@/features/jobs/domain/job-status.enum';
import { SubscriptionStatus } from '@/features/billing/domain/subscription-status.enum';

export interface AdminOverviewStats {
  totalUsers: number;
  totalCompanies: number;
  activeJobs: number;
  activeSubscriptions: number;
}

@Injectable()
export class AdminAnalyticsService {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
    @InjectRepository(CompanyOrmEntity)
    private readonly companyRepo: Repository<CompanyOrmEntity>,
    @InjectRepository(JobOrmEntity)
    private readonly jobRepo: Repository<JobOrmEntity>,
    @InjectRepository(SubscriptionOrmEntity)
    private readonly subRepo: Repository<SubscriptionOrmEntity>,
  ) {}

  /**
   * Retrieves aggregate metrics across platform entities.
   */
  async getOverviewStats(): Promise<AdminOverviewStats> {
    const [totalUsers, totalCompanies, activeJobs, activeSubscriptions] =
      await Promise.all([
        this.userRepo.count(),
        this.companyRepo.count(),
        this.jobRepo.count({ where: { status: JobStatus.PUBLISHED } }),
        this.subRepo.count({ where: { status: SubscriptionStatus.ACTIVE } }),
      ]);

    return {
      totalUsers,
      totalCompanies,
      activeJobs,
      activeSubscriptions,
    };
  }

  /**
   * Placeholder for user growth metrics .
   */
  getUserGrowthMetrics() {
    return {
      status: 'DEFERRED',
      message: 'User growth analytics deferred for future release',
      data: null,
    };
  }

  /**
   * Placeholder  for  revenue metrics.
   */
  getRevenueMetrics() {
    return {
      status: 'DEFERRED',
      message: 'Revenue analytics deferred for future release',
      data: null,
    };
  }
}
