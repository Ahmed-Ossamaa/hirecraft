import { WorkerMachineSkill } from './worker-machine-skill.entity';

export class WorkerProfile {
  id!: string;
  userId!: string;
  title!: string;
  lastCompany!: string | null;
  bio!: string | null;
  country!: string;
  city!: string;
  skills?: WorkerMachineSkill[];

  createdAt!: Date;
  updatedAt!: Date;
}
