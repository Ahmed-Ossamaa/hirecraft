import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { UserOrmEntity } from '../../users/infrastructure/user.orm-entity';
import { WorkerMachineSkillOrmEntity } from './worker-machine-skill.orm-entity';
import { EducationLevel } from '../domain/educational-lvl.enum';

@Entity('worker_profiles')
export class WorkerProfileOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // 1  profile ==> for 1 user
  @Index('worker_profile_user_id_idx', { unique: true })
  @Column({ type: 'uuid' })
  userId!: string;

  @Index('worker_profile_title_idx')
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastCompany?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Index('worker_profile_country_idx')
  @Column({ type: 'varchar', length: 100 })
  country!: string;

  @Index('worker_profile_city_idx')
  @Column({ type: 'varchar', length: 100 })
  city!: string;

  @Column({
    type: 'enum',
    enum: EducationLevel,
    nullable: true,
  })
  educationLevel?: EducationLevel;

  @Column({ type: 'varchar', length: 200, nullable: true })
  educationDetails?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // --- Relations ---

  // If the user deletes their account, delete their profile
  @OneToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: UserOrmEntity;

  @OneToMany(
    () => WorkerMachineSkillOrmEntity,
    (skill) => skill.workerProfile,
    {
      cascade: true,
    },
  )
  skills!: WorkerMachineSkillOrmEntity[];
}
