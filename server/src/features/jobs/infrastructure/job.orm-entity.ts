import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { CompanyOrmEntity } from '../../companies/infrastructure/company.orm-entity';
import { UserOrmEntity } from '../../users/infrastructure/user.orm-entity';
import { JobStatus } from '../domain/job-status.enum';
import { JobType } from '../domain/job-type.enum';
import { ExperienceLevel } from '../domain/exp-level.enum';
import { MachineCategoryOrmEntity } from '@/features/machine-categories/infrastructure/machine-category.orm-entity';
import { MachineOrmEntity } from '@/features/machines/infrastructure/machine.orm-entity';

@Entity('jobs')
@Index('job_location_idx', ['country', 'city'])
@Index('job_status_created_at_idx', ['status', 'createdAt'])
@Index('job_company_created_at_idx', ['companyId', 'createdAt'])
export class JobOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  companyId!: string;

  @Column({ type: 'uuid', nullable: true })
  authorId!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.DRAFT })
  status!: JobStatus;

  @Index('job_type_idx')
  @Column({ enum: JobType, default: JobType.FULL_TIME })
  jobType?: JobType;

  @Index('job_machine_category_id_idx')
  @Column({ type: 'uuid' })
  machineCategoryId!: string;

  @Index('job_machine_id_idx')
  @Column({ type: 'uuid' })
  machineId!: string;

  @Index('job_experience_level_idx')
  @Column({ type: 'enum', enum: ExperienceLevel })
  experienceLevel!: ExperienceLevel;

  @Column({ type: 'int', nullable: true })
  yearsOfExperience?: number;

  @Column({ type: 'text', array: true, nullable: true })
  requirements?: string[];

  @Column({ type: 'varchar', length: 100 })
  country!: string;

  @Column({ type: 'varchar', length: 100 })
  city!: string;

  @Column({ type: 'varchar', nullable: true })
  salaryRange?: string;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt?: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  // --- Relations

  // If a company is deleted, delete all its job posts
  @ManyToOne(() => CompanyOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company!: CompanyOrmEntity;

  // If a user is deleted, Job STAYS & Author is NULL
  @ManyToOne(() => UserOrmEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'authorId' })
  author!: UserOrmEntity;

  @ManyToOne(() => MachineCategoryOrmEntity, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @JoinColumn({ name: 'machineCategoryId' })
  category!: MachineCategoryOrmEntity;

  @ManyToOne(() => MachineOrmEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'machineId' })
  machine!: MachineOrmEntity;
}
