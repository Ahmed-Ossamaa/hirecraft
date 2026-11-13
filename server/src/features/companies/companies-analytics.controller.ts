import {
  Controller,
  Get,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiStandardResponse } from '@/common/swagger/api-standard-response.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CompanyRoleGuard } from '@/common/guards/company-role.guard';
import { SubscriptionPlanGuard } from '@/common/guards/subscription-plan.guard';
import { RequireCompanyRole } from '@/common/decorators/company-role.decorator';
import { RequireSubscriptionPlan } from '@/common/decorators/subscription-plan.decorator';
import { CompanyRole } from '@/features/company-members/domain/company-role.enum';
import { PlanId } from '@/features/plans/domain/plan-id.enum';
import { CompanyMachineryAnalyticsResponseDto } from './dto/company-machinery-analytics.dto';
import { CompaniesAnalyticsService } from './companies-analytics.service';

@ApiTags('Company Analytics')
@ApiBearerAuth()
@Controller('companies/me/analytics')
@UseGuards(JwtAuthGuard, CompanyRoleGuard, SubscriptionPlanGuard)
@RequireCompanyRole(
  CompanyRole.ADMIN,
  CompanyRole.HIRING_MANAGER,
  CompanyRole.STAFF,
)
@RequireSubscriptionPlan(
  PlanId.PRO_MONTHLY,
  PlanId.PRO_YEARLY,
  PlanId.ENTERPRISE_MONTHLY,
  PlanId.ENTERPRISE_YEARLY,
)
export class CompaniesAnalyticsController {
  constructor(
    private readonly companiesAnalyticsService: CompaniesAnalyticsService,
  ) {}

  @Get('machinery')
  @ApiOperation({
    summary:
      'Get top machinery demand and supply, optionally filtered to one machine',
  })
  @ApiQuery({
    name: 'machineId',
    required: false,
    type: String,
    format: 'uuid',
  })
  @ApiStandardResponse(CompanyMachineryAnalyticsResponseDto)
  @ApiResponse({
    status: 403,
    description:
      'Requires an associated company on a Professional or Enterprise plan.',
  })
  @ApiNotFoundResponse({ description: 'The selected machine does not exist.' })
  async getCompanyMachineryMetrics(
    @Query('machineId', new ParseUUIDPipe({ optional: true }))
    machineId?: string,
  ) {
    return this.companiesAnalyticsService.getMachineryMetrics(machineId);
  }
}
