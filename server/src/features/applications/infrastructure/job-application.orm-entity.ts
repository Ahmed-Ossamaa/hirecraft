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
import { ApplicationStatus } from '../domain/application-status.enum';
import { JobOrmEntity } from '../../jobs/infrastructure/job.orm-entity';
import { WorkerProfileOrmEntity } from '../../worker-profiles/infrastructure/worker-profile.orm-entity';

@Entity('job_applications')
@Index(['jobId', 'workerProfileId'], { unique: true })
export class JobApplicationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  jobId!: string;

  @Column({ type: 'uuid' })
  workerProfileId!: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status!: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  coverLetter?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // --- Relations ---

  @ManyToOne(() => JobOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  job!: JobOrmEntity;

  @ManyToOne(() => WorkerProfileOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workerProfileId' })
  workerProfile!: WorkerProfileOrmEntity;
}
