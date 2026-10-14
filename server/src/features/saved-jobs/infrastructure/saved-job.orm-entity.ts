import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { JobOrmEntity } from '@/features/jobs/infrastructure/job.orm-entity';
import { UserOrmEntity } from '@/features/users/infrastructure/user.orm-entity';

@Entity('saved_jobs')
@Index(['userId', 'jobId'], { unique: true })
export class SavedJobOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  jobId!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  // --- Relations ---

  @ManyToOne(() => JobOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  job!: JobOrmEntity;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: UserOrmEntity;
}
