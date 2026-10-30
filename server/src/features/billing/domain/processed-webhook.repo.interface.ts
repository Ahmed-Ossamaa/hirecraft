import { EntityManager } from 'typeorm';
import { PaymentProviderName } from '@/integrations/payment/domain/payment-provider.interface';

export const PROCESSED_WEBHOOK_REPOSITORY = Symbol(
  'PROCESSED_WEBHOOK_REPOSITORY',
);

export interface IProcessedWebhookRepository {
  /**
   * Attempts to record a processed webhook event.
   * Returns true if newly recorded, or false if already processed (duplicate eventId for provider).
   */
  tryRecordEvent(
    provider: PaymentProviderName,
    eventId: string,
    type: string,
    tx?: EntityManager,
  ): Promise<boolean>;
}
