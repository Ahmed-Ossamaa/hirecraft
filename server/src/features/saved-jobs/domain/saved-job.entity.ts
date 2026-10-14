import { Job } from '@/features/jobs/domain/job.entity';

export class SavedJob {
  id!: string;
  userId!: string;
  jobId!: string;
  createdAt!: Date;

  job?: Job;
}
