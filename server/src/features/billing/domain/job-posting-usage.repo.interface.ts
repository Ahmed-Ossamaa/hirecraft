import { EntityManager } from 'typeorm';

export const JOB_POSTING_USAGE_REPOSITORY = Symbol(
  'JOB_POSTING_USAGE_REPOSITORY',
);

export interface IJobPostingUsageRepository {
  countUsage(
    companyId: string,
    periodStart?: Date | null,
    periodEnd?: Date | null,
    tx?: EntityManager,
  ): Promise<number>;

  recordUsage(
    companyId: string,
    jobId: string,
    tx?: EntityManager,
  ): Promise<void>;
}
