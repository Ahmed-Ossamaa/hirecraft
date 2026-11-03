import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';
import { UserType } from '../domain/user-type.enum';
import { CompanyMemberOrmEntity } from '@/features/company-members/infrastructure/company-member.orm-entity';
import { WorkerProfileOrmEntity } from '@/features/worker-profiles/infrastructure/worker-profile.orm-entity';
import { Gender } from '../domain/gender.enum';

@Entity('users')
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  passwordHash!: string;

  @Column({ type: 'varchar', select: false, nullable: true })
  hashedRefreshToken?: string | null;

  @Index('idx_users_first_name')
  @Column()
  firstName!: string;

  @Index('idx_users_last_name')
  @Column()
  lastName!: string;

  @Index('idx_users_user_type')
  @Column({ type: 'enum', enum: UserType })
  userType!: UserType;

  @Column({ type: 'date', nullable: true })
  dob?: Date;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender?: Gender;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true, type: 'varchar' })
  avatarURL?: string | null;

  @Column({ nullable: true, type: 'varchar' })
  avatarPublicId?: string | null;

  @OneToMany(() => CompanyMemberOrmEntity, (member) => member.user)
  companyMembers!: CompanyMemberOrmEntity[];

  @OneToOne(() => WorkerProfileOrmEntity, (profile) => profile.user)
  workerProfile!: WorkerProfileOrmEntity;

  @Index('idx_users_is_banned')
  @Column({ type: 'boolean', default: false })
  isBanned!: boolean;

  @Column({ type: 'boolean', default: false })
  isEmailVerified!: boolean;

  @Column({ type: 'varchar', select: false, nullable: true })
  hashedVerifyEmailToken?: string | null;

  @Column({ type: 'timestamptz', select: false, nullable: true })
  verifyEmailTokenExpiresAt?: Date | null;

  @Column({ type: 'varchar', select: false, nullable: true })
  hashedResetPasswordToken?: string | null;

  @Column({ type: 'timestamptz', select: false, nullable: true })
  resetPasswordExpiresAt?: Date | null;

  @Column({ type: 'varchar', select: false, nullable: true })
  hashedInviteToken?: string | null;

  @Column({ type: 'timestamptz', select: false, nullable: true })
  inviteTokenExpiresAt?: Date | null;

  @Index('idx_users_created_at')
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
