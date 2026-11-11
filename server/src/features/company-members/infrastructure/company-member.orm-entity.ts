import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { CompanyRole } from '../domain/company-role.enum';
import { CompanyMemberStatus } from '../domain/company-member-status.enum';
import { UserOrmEntity } from '@/features/users/infrastructure/user.orm-entity';
import { CompanyOrmEntity } from '@/features/companies/infrastructure/company.orm-entity';

@Entity('company_members')
@Unique('UQ_company_members_user', ['userId'])
export class CompanyMemberOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @Column('uuid')
  companyId!: string;

  @Column({ type: 'enum', enum: CompanyRole, default: CompanyRole.STAFF })
  role!: CompanyRole;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt!: Date;

  @Column({
    type: 'enum',
    enum: CompanyMemberStatus,
    default: CompanyMemberStatus.ACTIVE,
  })
  status!: CompanyMemberStatus;

  @Column({ type: 'varchar', nullable: true })
  deactivationReason?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  deactivatedAt?: Date | null;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: UserOrmEntity;

  @ManyToOne(() => CompanyOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company?: CompanyOrmEntity;

  @Index()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
