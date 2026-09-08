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
  ForbiddenException,
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
import { ApiStandardResponse } from '@/common/swagger/api-standard-response.decorator';
import { CompanyMembersService } from './company-members.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserType } from '../users/domain/user-type.enum';
import { CompanyRole } from './domain/company-role.enum';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { CompanyMember } from './domain/company-member.entity';
import { InviteMemberDto } from './dto/invite-member.dto';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { ApiPaginatedResponse } from '@/common/swagger/api-paginated-response.decorator';

@ApiTags('Company Members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('company-members')
export class CompanyMembersController {
  constructor(private readonly companyMembersService: CompanyMembersService) {}

  @Get()
  @Roles(UserType.EMPLOYER)
  @ApiOperation({ summary: 'Get a list of members in my company' })
  @ApiPaginatedResponse(CompanyMember)
  async getMembers(
    @CurrentUser('companyId') companyId: string,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    if (!companyId) {
      throw new ForbiddenException('You are not associated with any company.');
    }
    return this.companyMembersService.getMembers(companyId, pageOptionsDto);
  }

  @Post('invite')
  @Roles(UserType.EMPLOYER)
  @ResponseMessage('Invite sent successfully.')
  @ApiOperation({ summary: 'Invite a new member to the company' })
  @ApiResponse({ status: 201, description: 'Invite sent' })
  async inviteMember(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('role') role: CompanyRole,
    @Body() dto: InviteMemberDto,
  ) {
    if (!companyId) {
      throw new ForbiddenException('You are not associated with any company.');
    }
    if (role !== CompanyRole.ADMIN && role !== CompanyRole.HIRING_MANAGER) {
      throw new ForbiddenException(
        'You do not have permission to invite members.',
      );
    }

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
  @ApiStandardResponse(CompanyMember)
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
    return this.companyMembersService.updateMemberRole(
      targetUserId,
      dto.role,
      callerUserType,
      callerUserId,
      callerCompanyId,
      callerRole,
    );
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserType.EMPLOYER)
  @ApiOperation({ summary: 'Remove a member from the company' })
  @ApiResponse({ status: 204, description: 'Member removed' })
  async removeMember(
    @Param('userId', ParseUUIDPipe) targetUserId: string,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('role') role: CompanyRole,
  ) {
    if (!companyId) {
      throw new ForbiddenException('You are not associated with any company.');
    }
    if (role !== CompanyRole.ADMIN) {
      throw new ForbiddenException(
        'Only company administrators can remove members.',
      );
    }

    await this.companyMembersService.removeMember(targetUserId, companyId);
  }
}
