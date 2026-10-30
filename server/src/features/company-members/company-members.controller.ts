import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CompanyMembersService } from './company-members.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/role.guard';
import { CompanyRoleGuard } from '@/common/guards/company-role.guard';
import { RequireCompanyRole } from '@/common/decorators/company-role.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserType } from '../users/domain/user-type.enum';
import { CompanyRole } from './domain/company-role.enum';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GetCompanyMembersDto } from './dto/get-company-members.dto';
import { CompanyMemberResponseDto } from './dto/company-member-response.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { ApiPaginatedResponse } from '@/common/swagger/api-paginated-response.decorator';
import { ApiStandardResponse } from '@/common/swagger/api-standard-response.decorator';

@ApiTags('Company Members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, CompanyRoleGuard)
@Controller('company-members')
export class CompanyMembersController {
  constructor(private readonly companyMembersService: CompanyMembersService) {}

  @Get()
  @RequireCompanyRole(
    CompanyRole.ADMIN,
    CompanyRole.HIRING_MANAGER,
    CompanyRole.STAFF,
  )
  @ApiOperation({ summary: 'Get a list of members in my company' })
  @ApiPaginatedResponse(CompanyMemberResponseDto)
  async getMembers(
    @CurrentUser('companyId') companyId: string,
    @Query() queryDto: GetCompanyMembersDto,
  ) {
    const result = await this.companyMembersService.getMembers(
      companyId,
      queryDto,
      queryDto.status,
    );
    return {
      ...result,
      data: result.data.map((member) =>
        CompanyMemberResponseDto.fromDomain(member),
      ),
    };
  }

  @Post('invite')
  @RequireCompanyRole(CompanyRole.ADMIN, CompanyRole.HIRING_MANAGER)
  @ResponseMessage('Invite sent successfully.')
  @ApiOperation({ summary: 'Invite a new member to the company' })
  @ApiResponse({ status: 201, description: 'Invite sent' })
  async inviteMember(
    @CurrentUser('companyId') companyId: string,
    @Body() dto: InviteMemberDto,
  ) {
    await this.companyMembersService.inviteUser(
      {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
      },
      companyId,
    );
  }

  @Patch(':userId/role')
  @Roles(UserType.EMPLOYER, UserType.PLATFORM_ADMIN)
  @ApiOperation({ summary: "Update a member's role in their active company" })
  @ApiStandardResponse(CompanyMemberResponseDto)
  @ApiResponse({
    status: 200,
    description: 'Member role updated successfully.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden. Company admin changing self-role, non-admin employer, cross-company modification, or demoting last admin.',
  })
  @ApiResponse({
    status: 404,
    description: 'Active company membership not found.',
  })
  async updateMemberRole(
    @Param('userId', ParseUUIDPipe) targetUserId: string,
    @Body() dto: UpdateMemberRoleDto,
    @CurrentUser('id') callerUserId: string,
    @CurrentUser('userType') callerUserType: UserType,
    @CurrentUser('companyId') callerCompanyId?: string,
    @CurrentUser('role') callerRole?: CompanyRole,
  ) {
    const member = await this.companyMembersService.updateMemberRole(
      targetUserId,
      dto.role,
      callerUserType,
      callerUserId,
      callerCompanyId,
      callerRole,
    );
    return CompanyMemberResponseDto.fromDomain(member);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequireCompanyRole(CompanyRole.ADMIN)
  @ApiOperation({ summary: 'Remove a member from the company' })
  @ApiResponse({ status: 204, description: 'Member removed' })
  async removeMember(
    @Param('userId', ParseUUIDPipe) targetUserId: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    await this.companyMembersService.removeMember(targetUserId, companyId);
  }

  @Post(':userId/suspend')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequireCompanyRole(CompanyRole.ADMIN)
  @ApiOperation({ summary: 'Suspend a member from the company' })
  @ApiResponse({ status: 204, description: 'Member suspended' })
  async suspendMember(
    @Param('userId', ParseUUIDPipe) targetUserId: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    await this.companyMembersService.suspendMember(targetUserId, companyId);
  }

  @Post(':userId/activate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequireCompanyRole(CompanyRole.ADMIN)
  @ApiOperation({ summary: 'Activate/Restore a member in the company' })
  @ApiResponse({ status: 204, description: 'Member activated' })
  async activateMember(
    @Param('userId', ParseUUIDPipe) targetUserId: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    await this.companyMembersService.activateMember(targetUserId, companyId);
  }
}
