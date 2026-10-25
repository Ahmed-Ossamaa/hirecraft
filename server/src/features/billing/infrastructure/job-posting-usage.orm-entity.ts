import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { CompanyOrmEntity } from '@/features/companies/infrastructure/company.orm-entity';
import { JobOrmEntity } from '@/features/jobs/infrastructure/job.orm-entity';

@Entity('job_posting_usages')
@Index('IDX_job_posting_usage_company_period', ['companyId', 'publishedAt'])
export class JobPostingUsageOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  companyId!: string;

  @ManyToOne(() => CompanyOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company?: CompanyOrmEntity;

  @Column({ type: 'uuid', nullable: true })
  jobId?: string | null;

  @ManyToOne(() => JobOrmEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'jobId' })
  job?: JobOrmEntity | null;

  @CreateDateColumn({ type: 'timestamptz' })
  publishedAt!: Date;
}
