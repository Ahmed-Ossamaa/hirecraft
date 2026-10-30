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
import { AdminService } from '../services/admin.service';
import { AdminBillingQueryDto } from '../dto/admin-billing-query.dto';
import { AdminSubscriptionResponseDto } from '../dto/admin-subscription-response.dto';
import { ApiPaginatedResponse } from '@/common/swagger/api-paginated-response.decorator';

@ApiTags('Admin Billing')
@ApiBearerAuth()
@Controller('admin/billing')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.PLATFORM_ADMIN)
export class AdminBillingController {
  constructor(private readonly adminService: AdminService) {}

  @Get('subscriptions')
  @ApiOperation({
    summary: 'Get paginated list of all platform subscriptions (Admin only)',
  })
  @ApiPaginatedResponse(AdminSubscriptionResponseDto)
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  async getSubscriptions(@Query() query: AdminBillingQueryDto) {
    const result = await this.adminService.getSubscriptions(query);
    return {
      ...result,
      data: result.data.map((sub) =>
        AdminSubscriptionResponseDto.fromDomain(sub),
      ),
    };
  }
}
