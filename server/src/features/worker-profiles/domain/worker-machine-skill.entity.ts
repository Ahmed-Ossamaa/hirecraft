import { ExperienceLevel } from '@/features/jobs/domain/exp-level.enum';

export class WorkerMachineSkill {
  id!: string;
  machineId!: string;
  experienceLevel!: ExperienceLevel;
  yearsOfExperience!: number;
  machineNameEn?: string;
  machineNameAr?: string;

  categoryNameEn?: string;
  categoryNameAr?: string;
}
