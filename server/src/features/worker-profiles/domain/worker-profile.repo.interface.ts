import { ExperienceLevel } from '@/features/jobs/domain/exp-level.enum';
import { WorkerProfile } from './worker-profile.entity';
import { WorkerMachineSkill } from './worker-machine-skill.entity';
import type {
  PageResultWithHasNext,
  PaginationOptions,
} from '@/common/pagination/pagination.types';

export const WORKER_PROFILE_REPOSITORY = Symbol('WORKER_PROFILE_REPOSITORY');

export interface CreateWorkerProfileParams {
  userId: string;
  title: string;
  lastCompany?: string;
  bio?: string;
  country: string;
  city: string;
}

export interface WorkerProfileSearchCriteria {
  machineCategoryId?: string;
  machineId?: string;
  experienceLevel?: ExperienceLevel;
  country?: string;
  city?: string;
}

export interface WorkerProfileSearchResult {
  id: string;
  title: string;
  country: string;
  city: string;
  firstName: string;
  lastName: string;
  avatarURL: string | null;
}

export type UpdateWorkerProfileParams = Partial<
  Omit<CreateWorkerProfileParams, 'userId'>
>;

export interface AddMachineSkillParams {
  machineId: string;
  experienceLevel: ExperienceLevel;
  yearsOfExperience: number;
}

export type UpdateMachineSkillParams = Partial<
  Omit<AddMachineSkillParams, 'machineId'>
>;
export interface WorkerProfileRepositoryInterface {
  findByUserId(userId: string): Promise<WorkerProfile | null>;
  existsByUserId(userId: string): Promise<boolean>;
  findById(id: string): Promise<WorkerProfile | null>;

  create(data: CreateWorkerProfileParams): Promise<WorkerProfile>;

  update(
    userId: string,
    params: UpdateWorkerProfileParams,
  ): Promise<WorkerProfile | null>;

  addSkill(
    workerProfileId: string,
    params: AddMachineSkillParams,
  ): Promise<WorkerMachineSkill>;

  updateSkill(
    skillId: string,
    params: UpdateMachineSkillParams,
    profileId: string,
  ): Promise<WorkerMachineSkill | null>;
  deleteSkill(skillId: string): Promise<void>;

  getProfileId(userId: string): Promise<string | null>;
  findProfileIdsByUserIds(userIds: string[]): Promise<Map<string, string>>;

  /**
   * @description Find worker profiles based on the provided search criteria and pagination options.
   */
  findByCriteria(
    criteria: WorkerProfileSearchCriteria,
    pagination: PaginationOptions,
  ): Promise<PageResultWithHasNext<WorkerProfileSearchResult>>;
}
