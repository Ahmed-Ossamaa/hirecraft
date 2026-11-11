import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAnalyticsReadRepository } from '../domain/repositories/analytics-read.repo.interface';
import {
  TimeSeriesBucketPoint,
  UserRoleCount,
  SubscriptionBillingSnapshot,
  ApplicationStatusCount,
  MachineryDemandSupplyPoint,
} from '../domain/models/analytics-read.models';
import { UserOrmEntity } from '@/features/users/infrastructure/user.orm-entity';
import { UserType } from '@/features/users/domain/user-type.enum';
import { JobOrmEntity } from '@/features/jobs/infrastructure/job.orm-entity';
import { SubscriptionOrmEntity } from '@/features/billing/infrastructure/subscription.orm-entity';
import { JobApplicationOrmEntity } from '@/features/applications/infrastructure/job-application.orm-entity';
import { MachineOrmEntity } from '@/features/machines/infrastructure/machine.orm-entity';
import { JobStatus } from '@/features/jobs/domain/job-status.enum';
import { SubscriptionStatus } from '@/features/billing/domain/subscription-status.enum';
import { ApplicationStatus } from '@/features/applications/domain/application-status.enum';

interface RawUserGrowthPoint {
  date: string;
  candidates: number | string;
  employers: number | string;
  total: number | string;
}

interface RawUserCountsRow {
  total?: string | null;
  candidates?: string | null;
  employers?: string | null;
}

interface RawApplicationStatusRow {
  status: ApplicationStatus;
  count: string;
}

interface RawMachinerySupplyDemandRow {
  machineId: string;
  nameEn: string;
  nameAr: string;
  categoryEn: string;
  categoryAr: string;
  activeJobsDemand: number | string;
  distinctWorkersSupply: number | string;
}

interface RawEarliestDateRow {
  minDate?: string | Date | null;
}

@Injectable()
export class TypeOrmAnalyticsReadRepository implements IAnalyticsReadRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
    @InjectRepository(JobOrmEntity)
    private readonly jobRepo: Repository<JobOrmEntity>,
    @InjectRepository(SubscriptionOrmEntity)
    private readonly subRepo: Repository<SubscriptionOrmEntity>,
    @InjectRepository(JobApplicationOrmEntity)
    private readonly appRepo: Repository<JobApplicationOrmEntity>,
    @InjectRepository(MachineOrmEntity)
    private readonly machineRepo: Repository<MachineOrmEntity>,
  ) {}

  async getPlatformUserGrowthTimeSeries(
    start: Date,
    end: Date,
    interval: 'day' | 'week' | 'month',
  ): Promise<TimeSeriesBucketPoint[]> {
    const stepInterval =
      interval === 'month'
        ? '1 month'
        : interval === 'week'
          ? '1 week'
          : '1 day';
    const dateFormat = interval === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD';

    const sql = `
      WITH date_series AS (
        SELECT generate_series(
          date_trunc($1, $2::timestamptz AT TIME ZONE 'UTC'),
          date_trunc($1, $3::timestamptz AT TIME ZONE 'UTC'),
          $4::interval
        ) AS bucket_start
      ),
      user_counts AS (
        SELECT
          date_trunc($1, "createdAt" AT TIME ZONE 'UTC') AS bucket_start,
          COUNT(*) FILTER (WHERE "userType" = 'CANDIDATE') AS candidates,
          COUNT(*) FILTER (WHERE "userType" = 'EMPLOYER') AS employers,
          COUNT(*) AS total
        FROM users
        WHERE "createdAt" >= $2 AND "createdAt" <= $3
          AND "userType" != 'PLATFORM_ADMIN'
        GROUP BY 1
      )
      SELECT
        to_char(ds.bucket_start, $5) AS date,
        COALESCE(uc.candidates, 0)::int AS candidates,
        COALESCE(uc.employers, 0)::int AS employers,
        COALESCE(uc.total, 0)::int AS total
      FROM date_series ds
      LEFT JOIN user_counts uc ON ds.bucket_start = uc.bucket_start
      ORDER BY ds.bucket_start ASC;
    `;

    const rawRows = await this.userRepo.query<RawUserGrowthPoint[]>(sql, [
      interval,
      start.toISOString(),
      end.toISOString(),
      stepInterval,
      dateFormat,
    ]);

    return rawRows.map((r) => ({
      date: r.date,
      candidates: Number(r.candidates),
      employers: Number(r.employers),
      total: Number(r.total),
    }));
  }

  async getPlatformUserCounts(
    start?: Date,
    end?: Date,
  ): Promise<UserRoleCount> {
    let qb = this.userRepo
      .createQueryBuilder('user')
      .where('user.userType != :adminType', {
        adminType: UserType.PLATFORM_ADMIN,
      })
      .select('COUNT(*)', 'total')
      .addSelect(
        "COUNT(*) FILTER (WHERE user.userType = 'CANDIDATE')",
        'candidates',
      )
      .addSelect(
        "COUNT(*) FILTER (WHERE user.userType = 'EMPLOYER')",
        'employers',
      );

    if (start && end) {
      qb = qb.andWhere('user.createdAt >= :start AND user.createdAt < :end', {
        start,
        end,
      });
    }

    const res = await qb.getRawOne<RawUserCountsRow>();
    return {
      total: parseInt(res?.total ?? '0', 10),
      candidates: parseInt(res?.candidates ?? '0', 10),
      employers: parseInt(res?.employers ?? '0', 10),
    };
  }

  async getPlatformActiveJobCount(): Promise<number> {
    const count = await this.jobRepo
      .createQueryBuilder('job')
      .where('job.status = :status', { status: JobStatus.PUBLISHED })
      .andWhere('job.expiresAt > :now', { now: new Date() })
      .getCount();
    return count;
  }

  async getPlatformJobPostingsCount(start: Date, end: Date): Promise<number> {
    const count = await this.jobRepo
      .createQueryBuilder('job')
      .where('job.createdAt >= :start AND job.createdAt < :end', { start, end })
      .getCount();
    return count;
  }

  async getPlatformActiveSubscriptions(): Promise<
    SubscriptionBillingSnapshot[]
  > {
    const subs = await this.subRepo
      .createQueryBuilder('sub')
      .where('sub.status = :status', { status: SubscriptionStatus.ACTIVE })
      .andWhere('sub.currentPeriodEnd > :now', { now: new Date() })
      .getMany();

    return subs.map((sub) => ({
      id: sub.id,
      companyId: sub.companyId,
      planId: sub.planId,
      amount: sub.amount,
      currency: sub.currency,
      billingInterval: sub.billingInterval,
      providerPriceId: sub.providerPriceId,
      status: sub.status,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      createdAt: sub.createdAt,
    }));
  }

  async getPlatformApplicationStatusDistribution(
    start?: Date,
    end?: Date,
  ): Promise<ApplicationStatusCount[]> {
    let qb = this.appRepo
      .createQueryBuilder('app')
      .select('app.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('app.status');

    if (start && end) {
      qb = qb.where('app.createdAt >= :start AND app.createdAt < :end', {
        start,
        end,
      });
    }

    const rows = await qb.getRawMany<RawApplicationStatusRow>();
    return rows.map((r) => ({
      status: r.status,
      count: parseInt(r.count, 10),
    }));
  }

  async getPlatformMachinerySupplyAndDemand(
    limit = 10,
  ): Promise<MachineryDemandSupplyPoint[]> {
    const sql = `
      SELECT
        m.id AS "machineId",
        m."nameEn" AS "nameEn",
        m."nameAr" AS "nameAr",
        c."nameEn" AS "categoryEn",
        c."nameAr" AS "categoryAr",
        COALESCE(j.demand, 0)::int AS "activeJobsDemand",
        COALESCE(w.supply, 0)::int AS "distinctWorkersSupply"
      FROM machines m
      INNER JOIN machine_categories c ON m."categoryId" = c.id
      LEFT JOIN (
        SELECT "machineId", COUNT(*) AS demand
        FROM jobs
        WHERE status = 'PUBLISHED' AND "expiresAt" > NOW()
        GROUP BY "machineId"
      ) j ON m.id = j."machineId"
      LEFT JOIN (
        SELECT "machineId", COUNT(DISTINCT "workerProfileId") AS supply
        FROM worker_machine_skills
        GROUP BY "machineId"
      ) w ON m.id = w."machineId"
      ORDER BY "activeJobsDemand" DESC, "distinctWorkersSupply" DESC
      LIMIT $1;
    `;

    const rawRows = await this.machineRepo.query<RawMachinerySupplyDemandRow[]>(
      sql,
      [limit],
    );

    return rawRows.map((r) => {
      const demand = Number(r.activeJobsDemand);
      const supply = Number(r.distinctWorkersSupply);
      const ratio = demand === 0 ? null : Number((supply / demand).toFixed(2));

      return {
        machineId: r.machineId,
        nameEn: r.nameEn,
        nameAr: r.nameAr,
        categoryEn: r.categoryEn,
        categoryAr: r.categoryAr,
        activeJobsDemand: demand,
        distinctWorkersSupply: supply,
        supplyToDemandRatio: ratio,
      };
    });
  }

  async getPlatformEarliestRecordDate(): Promise<Date> {
    const row = await this.userRepo
      .createQueryBuilder('user')
      .where('user.userType != :adminType', {
        adminType: UserType.PLATFORM_ADMIN,
      })
      .select('MIN(user.createdAt)', 'minDate')
      .getRawOne<RawEarliestDateRow>();

    return row?.minDate
      ? new Date(row.minDate)
      : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  }
}
