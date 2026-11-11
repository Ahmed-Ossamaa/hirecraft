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
import { PlanId } from '@/features/plans/domain/plan-id.enum';

@Entity('subscriptions')
@Index('IDX_UNIQUE_ACTIVE_OR_PAST_DUE_SUBSCRIPTION', ['companyId'], {
  unique: true,
  where: "status IN ('ACTIVE', 'PAST_DUE')",
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

  @Column({ type: 'enum', enum: PlanId })
  planId!: PlanId;

  @Column({ type: 'int', default: 0 })
  amount!: number;

  @Column({ type: 'varchar', length: 10, default: 'EGP' })
  currency!: string;

  @Column({ type: 'varchar', length: 20, default: 'month' })
  billingInterval!: 'month' | 'year';

  @Column({ type: 'varchar', nullable: true })
  providerPriceId?: string | null;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status!: SubscriptionStatus;

  @Column({ type: 'timestamptz' })
  currentPeriodStart!: Date;

  @Column({ type: 'timestamptz' })
  currentPeriodEnd!: Date;

  @Column({ type: 'boolean', default: false })
  cancelAtPeriodEnd!: boolean;

  @Column({ type: 'enum', enum: PlanId, nullable: true })
  scheduledPlanId?: PlanId | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
