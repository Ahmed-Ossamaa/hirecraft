import { WorkerProfile } from './worker-profile.entity';

export const WORKER_PROFILE_REPOSITORY = Symbol('WORKER_PROFILE_REPOSITORY');

export interface CreateWorkerProfileParams {
  userId: string;
  title: string;
  lastCompany?: string;
  bio?: string;
  country: string;
  city: string;
}

export interface UpdateWorkerProfileParams {
  title?: string;
  lastCompany?: string;
  bio?: string;
  country?: string;
  city?: string;
}
export interface WorkerProfileRepositoryInterface {
  findByUserId(userId: string): Promise<WorkerProfile | null>;
  findById(id: string): Promise<WorkerProfile | null>;

  create(data: CreateWorkerProfileParams): Promise<WorkerProfile>;

  update(
    id: string,
    data: UpdateWorkerProfileParams,
  ): Promise<WorkerProfile | null>;
}
