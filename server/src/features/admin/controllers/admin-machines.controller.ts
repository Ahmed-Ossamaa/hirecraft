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
import { Machine } from '@/features/machines/domain/machine.entity';
import { CreateMachineDto } from '@/features/machines/dto/create-machine.dto';
import { UpdateMachineDto } from '@/features/machines/dto/update-machine.dto';
import { AdminService } from '../services/admin.service';

@ApiBearerAuth()
@ApiTags('Admin Machines')
@Controller('admin/machines')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.PLATFORM_ADMIN)
export class AdminMachinesController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create a machine (Platform Admin only)' })
  @ApiStandardResponse(Machine)
  @ApiResponse({ status: 201, description: 'Machine created successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  createMachine(@Body() dto: CreateMachineDto): Promise<Machine> {
    return this.adminService.createMachine(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a machine (Platform Admin only)' })
  @ApiResponse({ status: 200, description: 'Machine updated successfully.' })
  @ApiResponse({ status: 404, description: 'Machine not found.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  updateMachine(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMachineDto,
  ): Promise<void> {
    return this.adminService.updateMachine(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a machine (Platform Admin only)' })
  @ApiResponse({ status: 204, description: 'Machine deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Machine not found.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  @ApiResponse({ status: 409, description: 'Machine is in use.' })
  deleteMachine(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.adminService.deleteMachine(id);
  }
}
