import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { WorkerProfileOrmEntity } from './worker-profile.orm-entity';
import { MachineOrmEntity } from '@/features/machines/infrastructure/machine.orm-entity';
import { ExperienceLevel } from '@/features/jobs/domain/exp-level.enum';

@Entity('worker_machine_skills')
// A worker cannot list the the same machine twice
@Unique('unique_worker_machine_idx', ['workerProfileId', 'machineId'])
export class WorkerMachineSkillOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('skill_worker_profile_id_idx')
  @Column({ type: 'uuid' })
  workerProfileId!: string;

  @Index('skill_machine_id_idx')
  @Column({ type: 'uuid' })
  machineId!: string;

  @Index('skill_experience_level_idx')
  @Column({ type: 'enum', enum: ExperienceLevel })
  experienceLevel!: ExperienceLevel;

  @Column({ type: 'int' })
  yearsOfExperience!: number;

  // --- Relations ---

  // If the worker profile is deleted, delete their skills
  @ManyToOne(() => WorkerProfileOrmEntity, (profile) => profile.skills, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'workerProfileId' })
  workerProfile!: WorkerProfileOrmEntity;

  // Cannot delete a machine if workers are listing it as a skill
  @ManyToOne(() => MachineOrmEntity, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @JoinColumn({ name: 'machineId' })
  machine!: MachineOrmEntity;
}
