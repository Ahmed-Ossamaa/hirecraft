import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SubscriptionsService } from '../subscriptions.service';
import { CreateCheckoutSessionDto } from '../dto/create-checkout-session.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('checkout/company/:companyId')
  @ApiOperation({ summary: 'Create a checkout session for a company' })
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
}
