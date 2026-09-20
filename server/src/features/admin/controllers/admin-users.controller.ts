import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiStandardResponse } from '@/common/swagger/api-standard-response.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserType } from '@/features/users/domain/user-type.enum';
import { User } from '@/features/users/domain/user.entity';
import { AdminService } from '../services/admin.service';
import { AdminUsersQueryDto } from '../dto/admin-users-query.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { ApiPaginatedResponse } from '@/common/swagger/api-paginated-response.decorator';

@ApiTags('Admin - Manage Users')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.PLATFORM_ADMIN)
export class AdminUsersController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({
    summary: 'Get paginated list of users with filters (Admin only)',
  })
  @ApiPaginatedResponse(User)
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  async getUsers(@Query() query: AdminUsersQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get details of a specific user by ID (Admin only)',
  })
  @ApiStandardResponse(User)
  @ApiResponse({
    status: 200,
    description: 'Returns user details.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch(':id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Ban or unban a user (Admin only)' })
  @ApiResponse({
    status: 204,
    description: 'User ban status updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  async updateUserBanStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserStatusDto,
  ) {
    await this.adminService.updateUserBanStatus(id, body.isBanned);
  }
}
