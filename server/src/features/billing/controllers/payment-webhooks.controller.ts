import {
  Controller,
  Post,
  Req,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { SubscriptionsService } from '../subscriptions.service';
import type { Request } from 'express';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
  PaymentEvent,
} from '../domain/payment-provider.interface';

@Controller('webhooks/payment')
export class PaymentWebhooksController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    @Inject(PAYMENT_PROVIDER)
    private readonly paymentProvider: PaymentProvider,
  ) {}

  @Post()
  @ApiExcludeEndpoint()
  async handleWebhook(@Req() req: RawBodyRequest<Request>) {
    let event: PaymentEvent;
    try {
      const rawBody = req.rawBody;

      if (!rawBody) {
        throw new BadRequestException('Raw request body is unavailable.');
      }

      event = this.paymentProvider.verifyWebhook({
        payload: rawBody,
        headers: req.headers,
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Webhook Error';
      throw new BadRequestException(`Webhook Error: ${error}`);
    }

    await this.subscriptionsService.handlePaymentWebhook(event);

    return { received: true };
  }
}
