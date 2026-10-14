import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  SAVED_JOB_REPOSITORY,
  type ISavedJobRepository,
} from './domain/saved-job.repo.interface';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';
import { JobsService } from '../jobs/jobs.service';
import { SavedJob } from './domain/saved-job.entity';

@Injectable()
export class SavedJobsService {
  constructor(
    @Inject(SAVED_JOB_REPOSITORY)
    private readonly savedJobRepo: ISavedJobRepository,
    private readonly jobsService: JobsService,
  ) {}

  async saveJob(userId: string, jobId: string): Promise<SavedJob> {
    const job = await this.jobsService.getJobById(jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const alreadySaved = await this.savedJobRepo.exists(userId, jobId);
    if (alreadySaved) {
      throw new ConflictException('Job is already saved');
    }

    const saved = await this.savedJobRepo.save({ userId, jobId });
    saved.job = job;
    return saved;
  }

  async unsaveJob(userId: string, jobId: string): Promise<boolean> {
    const deleted = await this.savedJobRepo.delete(userId, jobId);
    if (!deleted) {
      throw new NotFoundException('Saved job not found');
    }
    return true;
  }

  async getSavedJobs(
    userId: string,
    options: PageOptionsDto,
  ): Promise<PaginatedResult<SavedJob>> {
    return this.savedJobRepo.findAllByUser(userId, options);
  }
}
