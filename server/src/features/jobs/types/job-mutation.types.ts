import { CreateJobParams } from '../domain/job.repo.interface';

export type SalaryInput = {
  minimumSalary?: number;
  maximumSalary?: number;
  currency?: string;
};

export type CreateJobInput = Omit<
  CreateJobParams,
  'salaryRange' | 'salaryCurrency'
> &
  SalaryInput;

export type UpdateJobInput = Partial<
  Omit<
    CreateJobParams,
    | 'salaryRange'
    | 'salaryCurrency'
    | 'companyId'
    | 'authorId'
    | 'status'
    | 'publishedAt'
    | 'expiresAt'
  >
> &
  SalaryInput;
