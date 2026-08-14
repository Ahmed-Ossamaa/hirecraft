import { ExperienceLevel } from './exp-level.enum';
import { JobStatus } from './job-status.enum';
import { JobType } from './job-type.enum';

export class Job {
  id!: string;
  companyId!: string;
  authorId!: string;
  title!: string;
  description!: string;

  machineCategoryId!: string;
  machineId!: string;
  country!: string;
  city!: string;
  experienceLevel!: ExperienceLevel;
  yearsOfExperience?: number;

  status!: JobStatus;
  jobType?: JobType;
  salaryRange?: string;

  createdAt!: Date;
  updatedAt!: Date;
}
