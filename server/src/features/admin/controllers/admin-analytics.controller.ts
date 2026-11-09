import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserType } from '@/features/users/domain/user-type.enum';
import { AdminAnalyticsService } from '../services/admin-analytics.service';
import { ApiStandardResponse } from '@/common/swagger/api-standard-response.decorator';
import {
  AdminAnalyticsRangeQueryDto,
  AdminKpiMetricsDto,
  AdminUserGrowthResponseDto,
  AdminRevenueAnalyticsResponseDto,
  AdminRecruitmentAnalyticsResponseDto,
  AdminMachineryAnalyticsResponseDto,
} from '../dto/admin-analytics.dto';

@ApiTags('Admin Analytics')
@ApiBearerAuth()
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.PLATFORM_ADMIN)
export class AdminAnalyticsController {
  constructor(private readonly analyticsService: AdminAnalyticsService) {}

  @Get('overview')
  @ApiOperation({
    summary:
      'Get platform-wide executive KPI metrics with period comparison (Admin only)',
  })
  @ApiStandardResponse(AdminKpiMetricsDto)
  @ApiResponse({
    status: 200,
    description:
      'Returns MRR, ARR, active jobs, users, applications, and period deltas.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  async getOverviewStats(@Query() query: AdminAnalyticsRangeQueryDto) {
    return this.analyticsService.getOverviewStats(query.range);
  }

  @Get('user-growth')
  @ApiOperation({
    summary: 'Get time-series user growth metrics (Admin only)',
  })
  @ApiStandardResponse(AdminUserGrowthResponseDto)
  @ApiResponse({
    status: 200,
    description:
      'Returns time-bucketed user signups by role (Candidates vs Employers).',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  async getUserGrowthMetrics(@Query() query: AdminAnalyticsRangeQueryDto) {
    return this.analyticsService.getUserGrowthMetrics(query.range);
  }

  @Get('revenue')
  @ApiOperation({
    summary:
      'Get current MRR, ARR, and active subscription plan distribution (Admin only)',
  })
  @ApiStandardResponse(AdminRevenueAnalyticsResponseDto)
  @ApiResponse({
    status: 200,
    description:
      'Returns current MRR/ARR in EGP and breakdown of subscribers by plan tier.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  async getRevenueMetrics() {
    return this.analyticsService.getRevenueMetrics();
  }

  @Get('recruitment')
  @ApiOperation({
    summary: 'Get recruitment application status distribution (Admin only)',
  })
  @ApiStandardResponse(AdminRecruitmentAnalyticsResponseDto)
  @ApiResponse({
    status: 200,
    description: 'Returns counts and percentages across application statuses.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  async getRecruitmentMetrics(@Query() query: AdminAnalyticsRangeQueryDto) {
    return this.analyticsService.getRecruitmentMetrics(query.range);
  }

  @Get('machinery')
  @ApiOperation({
    summary:
      'Get top industrial machinery job demand vs skilled worker supply (Admin only)',
  })
  @ApiStandardResponse(AdminMachineryAnalyticsResponseDto)
  @ApiResponse({
    status: 200,
    description: 'Returns top machines by demand and distinct worker counts.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  async getMachineryMetrics() {
    return this.analyticsService.getMachineryMetrics();
  }
}
