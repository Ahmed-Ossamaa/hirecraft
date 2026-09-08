import { Controller, Get, UseGuards } from '@nestjs/common';
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
  AdminOverviewStatsDto,
  DeferredAnalyticsResponseDto,
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
    summary: 'Get platform-wide overview aggregate metrics (Admin only)',
  })
  @ApiStandardResponse(AdminOverviewStatsDto)
  @ApiResponse({
    status: 200,
    description:
      'Returns total users, total companies, active jobs, and active subscriptions.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  async getOverviewStats() {
    return this.analyticsService.getOverviewStats();
  }

  @Get('user-growth')
  @ApiOperation({
    summary: 'Get user growth metrics over time (Admin only)',
  })
  @ApiStandardResponse(DeferredAnalyticsResponseDto)
  @ApiResponse({
    status: 200,
    description: 'Returns user growth time-series data.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  getUserGrowthMetrics() {
    return this.analyticsService.getUserGrowthMetrics();
  }

  @Get('revenue')
  @ApiOperation({
    summary: 'Get revenue metrics over time (Admin only)',
  })
  @ApiStandardResponse(DeferredAnalyticsResponseDto)
  @ApiResponse({
    status: 200,
    description: 'Returns revenue time-series data.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  getRevenueMetrics() {
    return this.analyticsService.getRevenueMetrics();
  }
}
