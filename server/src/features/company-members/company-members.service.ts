import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import {
  type ICompanyMemberRepository,
  COMPANY_MEMBER_REPOSITORY,
  CreateCompanyMemberParams,
} from './domain/company-member.repo.interface';
import { CompanyMember } from './domain/company-member.entity';
import { CompanyRole } from './domain/company-role.enum';
import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';
import { UserType } from '../users/domain/user-type.enum';
import { UserInvitedEvent, UserAddedToCompanyEvent } from '@/integrations/mail/mail.events';
import appConfig from '@/config/app.config';

@Injectable()
export class CompanyMembersService {
  constructor(
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly companyMemberRepository: ICompanyMemberRepository,
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
    private readonly usersService: UsersService,
    private readonly companiesService: CompaniesService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async addMember(
    params: CreateCompanyMemberParams,
    tx?: any,
  ): Promise<CompanyMember> {
    return this.companyMemberRepository.create(params, tx);
  }

  async getMembershipByUserId(userId: string): Promise<CompanyMember | null> {
    return this.companyMemberRepository.findByUserId(userId);
  }
  async checkMembership(
    userId: string,
    companyId: string,
  ): Promise<CompanyMember | null> {
    return this.companyMemberRepository.findByUserIdAndCompanyId(
      userId,
      companyId,
    );
  }

  async getMembers(companyId: string, options: PageOptionsDto) {
    return this.companyMemberRepository.findAllByCompanyId(companyId, options);
  }

  async removeMember(userId: string, companyId: string): Promise<void> {
    const success = await this.companyMemberRepository.remove(userId, companyId);
    if (!success) {
      throw new NotFoundException('Member not found in this company.');
    }
  }

  async inviteUser(
    dto: { email: string; firstName: string; lastName: string; role: CompanyRole },
    companyId: string,
  ): Promise<void> {
    const company = await this.companiesService.getMyCompany(companyId);
    if (!company) {
      throw new NotFoundException('Company not found.');
    }

    let user = await this.usersService.findByEmail(dto.email);
    let inviteToken: string | null = null;

    if (user) {
      // User exists, just check if they are already in the company
      const existingMembership = await this.checkMembership(user.id, companyId);
      if (existingMembership) {
        throw new NotFoundException('User is already a member of this company.'); // better as BadRequest, but keeping it simple
      }
    } else {
      // Create new invited user
      const result = await this.usersService.createInvitedUser(
        dto.email,
        dto.firstName,
        dto.lastName,
        UserType.EMPLOYER,
      );
      user = result.user;
      inviteToken = result.inviteToken;
    }

    // Add them to the company
    await this.addMember({
      userId: user.id,
      companyId,
      role: dto.role,
    });

    if (inviteToken) {
      // new user -> send invite email
      const clientUrl = this.config.clientURL;
      const inviteLink = `${clientUrl}/accept-invite?token=${inviteToken}`;
      
      this.eventEmitter.emit(
        'user.invited',
        new UserInvitedEvent(user.email, company.name, dto.role, inviteLink),
      );
    } else {
      // Existing user -> send notification email
      this.eventEmitter.emit(
        'user.added_to_company',
        new UserAddedToCompanyEvent(user.email, company.name, dto.role),
      );
    }
  }
}
