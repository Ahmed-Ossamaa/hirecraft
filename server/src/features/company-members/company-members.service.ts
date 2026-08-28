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
import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';
import { UserType } from '../users/domain/user-type.enum';
import { DataSource, EntityManager } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../users/domain/user.entity';
import {
  UserInvitedEvent,
  UserAddedToCompanyEvent,
} from '@/integrations/mail/mail.events';
import appConfig from '@/config/app.config';
import { CompanyRole } from './domain/company-role.enum';

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
    private readonly dataSource: DataSource,
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
    const success = await this.companyMemberRepository.remove(
      userId,
      companyId,
    );
    if (!success) {
      throw new NotFoundException('Member not found in this company.');
    }
  }

  async inviteUser(
    dto: {
      email: string;
      firstName: string;
      lastName: string;
      role: CompanyRole;
    },
    companyId: string,
  ): Promise<void> {
    const company = await this.companiesService.getMyCompany(companyId);
    if (!company) {
      throw new NotFoundException('Company not found.');
    }

    const user = await this.usersService.findByEmail(dto.email);
    const { finalUser, finalInviteToken } = await this.dataSource.transaction(
      async (tx) => {
        let txUser = user;
        let txInviteToken: string | null = null;

        if (!txUser) {
          // Create new invited user
          const result = await this.createInvitedUser(
            dto.email,
            dto.firstName,
            dto.lastName,
            UserType.EMPLOYER,
            tx,
          );
          txUser = result.user;
          txInviteToken = result.inviteToken;
        }

        // Add them to the company
        await this.addMember(
          {
            userId: txUser.id,
            companyId,
            role: dto.role,
          },
          tx,
        );

        return { finalUser: txUser, finalInviteToken: txInviteToken };
      },
    );

    if (finalInviteToken) {
      // new user -> send invite email
      const clientUrl = this.config.clientURL;
      const inviteLink = `${clientUrl}/accept-invite?token=${finalInviteToken}`;

      this.eventEmitter.emit(
        'user.invited',
        new UserInvitedEvent(
          finalUser.email,
          company.name,
          dto.role,
          inviteLink,
        ),
      );
    } else {
      // Existing user -> send notification email
      this.eventEmitter.emit(
        'user.added_to_company',
        new UserAddedToCompanyEvent(finalUser.email, company.name, dto.role),
      );
    }
  }

  private async createInvitedUser(
    email: string,
    firstName: string,
    lastName: string,
    userType: UserType,
    tx: EntityManager,
  ): Promise<{ user: User; inviteToken: string }> {
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    const user = await this.usersService.createUser(
      {
        email,
        passwordHash,
        firstName,
        lastName,
        userType,
        phoneNumber: '',
      },
      tx,
    );

    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.usersService.saveInviteToken(user.id, hash, expiresAt, tx);

    return { user, inviteToken: token };
  }
}
