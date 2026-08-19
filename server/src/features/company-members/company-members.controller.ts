import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ForbiddenException,
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
import { Roles } from '@/common/decorators/roles.decorator';
import { UserType } from '../users/domain/user-type.enum';
import { CompanyRole } from './domain/company-role.enum';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { CompanyMember } from './domain/company-member.entity';
import { InviteMemberDto } from './dto/invite-member.dto';

@ApiTags('Company Members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('company-members')
export class CompanyMembersController {
  constructor(private readonly companyMembersService: CompanyMembersService) {}

  @Get()
  @Roles(UserType.EMPLOYER)
  @ApiOperation({ summary: 'Get a list of members in my company' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated members',
    type: [CompanyMember],
  })
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
    return { success: true, message: 'Invite sent successfully.' };
  }

  @Delete(':userId')
  @Roles(UserType.EMPLOYER)
  @ApiOperation({ summary: 'Remove a member from the company' })
  @ApiResponse({ status: 200, description: 'Member removed' })
  async removeMember(
    @Param('userId') targetUserId: string,
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
    return { success: true };
  }
}
