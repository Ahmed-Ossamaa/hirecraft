import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ProcessedWebhookOrmEntity } from './processed-webhook.orm-entity';
import { IProcessedWebhookRepository } from '../domain/processed-webhook.repo.interface';
import { PaymentProviderName } from '@/integrations/payment/domain/payment-provider.interface';

@Injectable()
export class ProcessedWebhookTypeormRepository implements IProcessedWebhookRepository {
  constructor(
    @InjectRepository(ProcessedWebhookOrmEntity)
    private readonly repository: Repository<ProcessedWebhookOrmEntity>,
  ) {}

  async tryRecordEvent(
    provider: PaymentProviderName,
    eventId: string,
    type: string,
    tx?: EntityManager,
  ): Promise<boolean> {
    const manager = tx || this.repository.manager;
    try {
      await manager.insert(ProcessedWebhookOrmEntity, {
        provider,
        eventId,
        type,
      });
      return true;
    } catch (err: unknown) {
      if (err instanceof Error && 'code' in err && err.code === '23505') {
        return false;
      }
      throw err;
    }
  }
}
