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
export class JobOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('job_company_id_idx')
  @Column({ type: 'uuid' })
  companyId!: string;

  @Column({ type: 'uuid', nullable: true })
  authorId!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Index('job_status_idx')
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

  @Index('job_country_idx')
  @Column({ type: 'varchar', length: 100 })
  country!: string;

  @Index('job_city_idx')
  @Column({ type: 'varchar', length: 100 })
  city!: string;

  @Column({ type: 'varchar', nullable: true })
  salaryRange?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
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
