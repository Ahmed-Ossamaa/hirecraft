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

  // Joined fields
  companyName?: string;
  companyLogo?: string;
  machineNameEn?: string;
  machineNameAr?: string;

  country!: string;
  city!: string;
  experienceLevel!: ExperienceLevel;
  yearsOfExperience?: number;
  requirements?: string[];

  status!: JobStatus;
  jobType?: JobType;
  salaryRange?: string;

  publishedAt?: Date | null;
  expiresAt?: Date | null;

  createdAt!: Date;
  updatedAt!: Date;
}
