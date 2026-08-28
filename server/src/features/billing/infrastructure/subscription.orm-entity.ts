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
import { CompanyOrmEntity } from '@/features/companies/infrastructure/company.orm-entity';
import { SubscriptionStatus } from '../domain/subscription-status.enum';

@Entity('subscriptions')
@Index('IDX_UNIQUE_ACTIVE_SUBSCRIPTION', ['companyId'], {
  unique: true,
  where: "status = 'ACTIVE'",
})
export class SubscriptionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  companyId!: string;

  @ManyToOne(() => CompanyOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company!: CompanyOrmEntity;

  @Column({ type: 'varchar', nullable: true })
  provider!: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  providerSubId?: string | null;

  @Column({ type: 'varchar' })
  planId!: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status!: SubscriptionStatus;

  @Column({ type: 'timestamp' })
  currentPeriodStart!: Date;

  @Column({ type: 'timestamp' })
  currentPeriodEnd!: Date;

  @Column({ type: 'boolean', default: false })
  cancelAtPeriodEnd!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
