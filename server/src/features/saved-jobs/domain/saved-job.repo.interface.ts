import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';
import { SavedJob } from './saved-job.entity';

export const SAVED_JOB_REPOSITORY = Symbol('SAVED_JOB_REPOSITORY');

export interface CreateSavedJobParams {
  userId: string;
  jobId: string;
}

export interface ISavedJobRepository {
  save(params: CreateSavedJobParams): Promise<SavedJob>;
  delete(userId: string, jobId: string): Promise<boolean>;
  findAllByUser(
    userId: string,
    options: PageOptionsDto,
  ): Promise<PaginatedResult<SavedJob>>;
  exists(userId: string, jobId: string): Promise<boolean>;
}
