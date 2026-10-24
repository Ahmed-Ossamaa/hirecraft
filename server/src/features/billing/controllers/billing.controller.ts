import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Param,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { SubscriptionsService } from '../services/subscriptions.service';
import { CreateCheckoutSessionDto } from '../dto/create-checkout-session.dto';
import { ConfirmCheckoutDto } from '../dto/confirm-checkout.dto';
import { ChangePlanDto, ChangePlanResponseDto } from '../dto/change-plan.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { ApiStandardResponse } from '@/common/swagger/api-standard-response.decorator';
import {
  CurrentSubscriptionDto,
  CancelSubscriptionDto,
} from '../dto/billing-responses.dto';
import { CheckoutSessionResponseDto } from '../dto/checkout-session-response.dto';

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('subscription')
  @ApiOperation({
    summary: 'Get current subscription for the authenticated user company',
  })
  @ApiStandardResponse(CurrentSubscriptionDto)
  @ApiResponse({
    status: 200,
    description: 'Returns current active subscription or default free plan.',
  })
  @ApiResponse({
    status: 400,
    description: 'User is not associated with a company.',
  })
  async getSubscription(@CurrentUser('companyId') companyId?: string) {
    if (!companyId) {
      throw new BadRequestException('User is not associated with a company.');
    }
    return this.subscriptionsService.getSubscriptionForCompany(companyId);
  }

  @Post('subscription/cancel')
  @ResponseMessage(
    'Subscription has been scheduled for cancellation at the end of the billing period.',
  )
  @ApiOperation({
    summary:
      'Cancel active subscription at the end of the current billing period',
  })
  @ApiStandardResponse(CancelSubscriptionDto)
  @ApiResponse({
    status: 200,
    description:
      'Subscription successfully scheduled for cancellation at period end.',
  })
  @ApiResponse({
    status: 400,
    description:
      'User is not associated with a company, or no active subscription to cancel.',
  })
  @ApiResponse({
    status: 403,
    description: 'User is not an ADMIN of the company.',
  })
  async cancelSubscription(
    @CurrentUser('id') userId: string,
    @CurrentUser('companyId') companyId?: string,
  ) {
    if (!companyId) {
      throw new BadRequestException('User is not associated with a company.');
    }
    return this.subscriptionsService.cancelSubscriptionAtPeriodEnd(
      companyId,
      userId,
    );
  }

  @Post('checkout/company/:companyId')
  @ApiOperation({ summary: 'Create a checkout session for a company' })
  @ApiStandardResponse(CheckoutSessionResponseDto)
  @ApiResponse({ status: 201, description: 'Returns the Stripe checkout URL.' })
  @ApiResponse({
    status: 409,
    description: 'Company already has an active subscription.',
  })
  async createCheckoutSession(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: CreateCheckoutSessionDto,
    @CurrentUser('id') userId: string,
  ) {
    const url = await this.subscriptionsService.createCheckoutSession(
      companyId,
      dto.planId,
      userId,
      dto.idempotencyKey,
    );
    return { url };
  }

  @Post('checkout/confirm')
  @ApiOperation({
    summary: 'Confirm and activate checkout session on success redirect',
  })
  @ApiStandardResponse(CurrentSubscriptionDto)
  @ApiResponse({
    status: 200,
    description: 'Returns the updated subscription state after reconciliation.',
  })
  @ApiResponse({
    status: 400,
    description: 'Checkout session is invalid or not paid.',
  })
  async confirmCheckout(
    @Body() dto: ConfirmCheckoutDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.subscriptionsService.confirmCheckoutSession(
      dto.sessionId,
      userId,
    );
  }

  @Post('subscription/change-plan')
  @ApiOperation({
    summary:
      'Change subscription plan: immediate upgrade or scheduled downgrade',
  })
  @ApiStandardResponse(ChangePlanResponseDto)
  @ApiResponse({
    status: 200,
    description:
      'Plan change processed: returns action (CHECKOUT, UPGRADED, or DOWNGRADE_SCHEDULED)',
  })
  async changePlan(
    @Body() dto: ChangePlanDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('companyId') companyId?: string,
  ) {
    if (!companyId) {
      throw new BadRequestException('User is not associated with a company.');
    }
    return this.subscriptionsService.changeSubscriptionPlan(
      companyId,
      dto.planId,
      userId,
      dto.idempotencyKey,
    );
  }
}
