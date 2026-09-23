import { WorkerMachineSkill } from './worker-machine-skill.entity';
import { Gender } from '../../users/domain/gender.enum';

export class WorkerProfile {
  id!: string;
  userId!: string;
  title!: string;
  lastCompany!: string | null;
  bio!: string | null;
  country!: string;
  city!: string;

  // Basic user info joined from User entity
  firstName?: string;
  lastName?: string;
  avatarURL?: string | null;
  dob?: Date;
  gender?: Gender;
  //phone number/email (maybe later or never, to be decided later)

  skills?: WorkerMachineSkill[];

  createdAt!: Date;
  updatedAt!: Date;
}
