import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiStandardResponse } from '@/common/swagger/api-standard-response.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserType } from '@/features/users/domain/user-type.enum';
import { MachineCategory } from '@/features/machine-categories/domain/machine-category.entity';
import { CreateMachineCategoryDto } from '@/features/machine-categories/dto/create-machine-category.dto';
import { UpdateMachineCategoryDto } from '@/features/machine-categories/dto/update-machine-category.dto';
import { AdminService } from '../services/admin.service';

@ApiBearerAuth()
@ApiTags('Admin Machine Categories')
@Controller('admin/machine-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.PLATFORM_ADMIN)
export class AdminMachineCategoriesController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create a machine category (Platform Admin only)' })
  @ApiStandardResponse(MachineCategory)
  @ApiResponse({
    status: 201,
    description: 'Machine category created successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  createMachineCategory(
    @Body() dto: CreateMachineCategoryDto,
  ): Promise<MachineCategory> {
    return this.adminService.createMachineCategory(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a machine category (Platform Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Machine category updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Machine category not found.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  updateMachineCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMachineCategoryDto,
  ): Promise<void> {
    return this.adminService.updateMachineCategory(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a machine category (Platform Admin only)',
  })
  @ApiResponse({
    status: 204,
    description: 'Machine category deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Machine category not found.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  @ApiResponse({ status: 409, description: 'Machine category is in use.' })
  deleteMachineCategory(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.adminService.deleteMachineCategory(id);
  }
}
