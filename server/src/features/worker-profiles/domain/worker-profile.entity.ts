import { WorkerMachineSkill } from './worker-machine-skill.entity';
import { Gender } from '../../users/domain/gender.enum';
import { EducationLevel } from './educational-lvl.enum';

export class WorkerProfile {
  id!: string;
  userId!: string;
  title!: string;
  lastCompany!: string | null;
  bio!: string | null;
  country!: string;
  city!: string;
  educationLevel!: EducationLevel | null;
  educationDetails!: string | null;

  // Basic user info joined from User entity
  firstName?: string;
  lastName?: string;
  avatarURL?: string | null;
  dob?: Date;
  gender?: Gender;
  phone?: string | null;
  email?: string;

  skills?: WorkerMachineSkill[];

  createdAt!: Date;
  updatedAt!: Date;
}
