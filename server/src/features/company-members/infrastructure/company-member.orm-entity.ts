import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CompanyRole } from '../domain/company-role.enum';
import { UserOrmEntity } from '@/features/users/infrastructure/user.orm-entity';
import { CompanyOrmEntity } from '@/features/companies/infrastructure/company.orm-entity';

@Entity('company_members')
@Index(['userId', 'companyId'], { unique: true })
@Index('IDX_one_active_company_per_user', ['userId'], {
  unique: true,
  where: '"isActive" = true',
})
export class CompanyMemberOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @Column('uuid')
  companyId!: string;

  @Column({ type: 'enum', enum: CompanyRole, default: CompanyRole.STAFF })
  role!: CompanyRole;

  @CreateDateColumn()
  joinedAt!: Date;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: UserOrmEntity;

  @ManyToOne(() => CompanyOrmEntity, (company) => company.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company?: CompanyOrmEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
