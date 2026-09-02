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
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of subscriptions.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  async getSubscriptions(@Query() query: AdminBillingQueryDto) {
    return this.adminService.getSubscriptions(query);
  }
}
