import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

import { PaymentProviderName } from '../domain/payment-provider.interface';

@Entity('processed_webhooks')
@Index('IDX_UNIQUE_PROCESSED_WEBHOOK', ['provider', 'eventId'], {
  unique: true,
})
export class ProcessedWebhookOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: PaymentProviderName,
  })
  provider!: PaymentProviderName;

  @Column({ type: 'varchar' })
  eventId!: string;

  @Column({ type: 'varchar' })
  type!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
