import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
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

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
