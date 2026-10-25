import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  forwardRef,
} from '@nestjs/common';
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
import { CompanyMemberStatus } from './domain/company-member-status.enum';
import { SubscriptionLimitsService } from '../billing/subscription-limits/subscription-limits.service';
import { CompanyMemberOrmEntity } from './infrastructure/company-member.orm-entity';

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
    @Inject(forwardRef(() => SubscriptionLimitsService))
    private readonly subscriptionLimitsService: SubscriptionLimitsService,
  ) {}

  async addMember(
    params: CreateCompanyMemberParams,
    tx?: EntityManager,
  ): Promise<CompanyMember> {
    return this.companyMemberRepository.create(params, tx);
  }

  async activateMember(userId: string, companyId: string): Promise<void> {
    await this.dataSource.transaction(async (tx) => {
      const membership =
        await this.companyMemberRepository.findByUserIdAndCompanyId(
          userId,
          companyId,
        );

      if (!membership) {
        throw new NotFoundException('Member not found in this company.');
      }

      if (membership.status === CompanyMemberStatus.ACTIVE) {
        return;
      }

      if (
        membership.status !== CompanyMemberStatus.SUSPENDED &&
        membership.status !== CompanyMemberStatus.DEACTIVATED
      ) {
        throw new BadRequestException(
          'Only suspended or deactivated members can be activated.',
        );
      }

      await this.subscriptionLimitsService.lockCompany(companyId, tx);
      await this.subscriptionLimitsService.checkCompanyMemberActiveLimit(
        companyId,
        tx,
      );

      await this.companyMemberRepository.updateStatus(
        userId,
        CompanyMemberStatus.ACTIVE,
        null,
        tx,
      );
    });
  }

  async acceptInvite(userId: string): Promise<void> {
    await this.dataSource.transaction(async (tx) => {
      const membership =
        await this.companyMemberRepository.findByUserId(userId);

      if (!membership) {
        throw new NotFoundException('Company membership not found.');
      }

      if (membership.status === CompanyMemberStatus.ACTIVE) {
        return;
      }

      if (membership.status !== CompanyMemberStatus.PENDING) {
        throw new ForbiddenException(
          'Invalid membership status to accept invitation.',
        );
      }

      await this.subscriptionLimitsService.lockCompany(
        membership.companyId,
        tx,
      );
      await this.subscriptionLimitsService.checkCompanyMemberActiveLimit(
        membership.companyId,
        tx,
      );

      await this.companyMemberRepository.acceptInvite(userId, tx);
    });
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

  async getMembers(
    companyId: string,
    options: PageOptionsDto,
    status?: CompanyMemberStatus,
  ) {
    return this.companyMemberRepository.findAllByCompanyId(
      companyId,
      options,
      status,
    );
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

  async suspendMember(userId: string, companyId: string): Promise<void> {
    await this.dataSource.transaction(async (tx) => {
      const membership =
        await this.companyMemberRepository.findByUserIdAndCompanyId(
          userId,
          companyId,
        );

      if (!membership) {
        throw new NotFoundException('Member not found in this company.');
      }

      if (membership.role === CompanyRole.ADMIN) {
        const activeAdminsCount =
          await this.companyMemberRepository.countActiveAdminsInCompany(
            companyId,
            tx,
          );
        if (activeAdminsCount <= 1) {
          throw new ForbiddenException(
            'Cannot suspend the last active admin of a company.',
          );
        }
      }

      await this.companyMemberRepository.updateStatus(
        userId,
        CompanyMemberStatus.SUSPENDED,
        null,
        tx,
      );
    });
  }

  async updateMemberRole(
    targetUserId: string,
    newRole: CompanyRole,
    callerUserType: UserType,
    callerUserId: string,
    callerCompanyId?: string,
    callerRole?: CompanyRole,
  ): Promise<CompanyMember> {
    return await this.dataSource.transaction(async (tx) => {
      const activeMember =
        await this.companyMemberRepository.findActiveByUserId(targetUserId, tx);

      if (!activeMember) {
        throw new NotFoundException('Active company membership not found.');
      }

      const targetCompanyId = activeMember.companyId;

      if (callerUserType === UserType.EMPLOYER) {
        if (callerRole !== CompanyRole.ADMIN) {
          throw new ForbiddenException(
            'Only company administrators can update member roles.',
          );
        }

        if (callerCompanyId !== targetCompanyId) {
          throw new ForbiddenException(
            'You do not have permission to change members belonging to another company.',
          );
        }

        if (callerUserId === targetUserId) {
          throw new ForbiddenException('You cant change your own role.');
        }
      }
      //keep atleast 1 admin per company
      if (
        activeMember.role === CompanyRole.ADMIN &&
        newRole !== CompanyRole.ADMIN
      ) {
        const activeAdminsCount =
          await this.companyMemberRepository.countActiveAdminsInCompany(
            targetCompanyId,
            tx,
          );

        if (activeAdminsCount <= 1) {
          throw new ForbiddenException(
            'Cannot demote the last active admin of a company.',
          );
        }
      }

      const updated = await this.companyMemberRepository.updateRole(
        targetUserId,
        newRole,
        tx,
      );

      if (!updated) {
        throw new NotFoundException('Active company membership not found.');
      }

      activeMember.role = newRole;
      return activeMember;
    });
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
        await this.subscriptionLimitsService.lockCompany(companyId, tx);
        await this.subscriptionLimitsService.checkCompanyMemberReservationLimit(
          companyId,
          tx,
        );

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
        } else {
          // Check if existing user is already a member of any company
          const existingMembership =
            await this.companyMemberRepository.findActiveByUserId(
              txUser.id,
              tx,
            );
          if (existingMembership) {
            if (existingMembership.companyId === companyId) {
              throw new ConflictException(
                'This user is already a member of your company.',
              );
            } else {
              throw new ConflictException(
                'This user is already a member of another company.',
              );
            }
          }
        }

        // Add them to the company
        await this.addMember(
          {
            userId: txUser.id,
            companyId,
            role: dto.role,
            status: CompanyMemberStatus.PENDING,
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

  /**
   * Reconciles company members down to the allowed maxUsers capacity:
   * 1. Cancels/deletes excess pending invitations first if ACTIVE + PENDING > maxUsers.
   * 2. Deactivates excess active members if ACTIVE > maxUsers, prioritizing non-admins first
   *    and never deactivating the last active admin.
   */
  async reconcileExcessMembers(
    companyId: string,
    maxUsers: number,
    tx: EntityManager,
  ): Promise<{ revokedPending: number; deactivatedActive: number }> {
    const memberRepo = tx.getRepository(CompanyMemberOrmEntity);

    const allMembers = await memberRepo.find({
      where: { companyId },
      order: { joinedAt: 'DESC', createdAt: 'DESC' },
    });

    const pendingMembers = allMembers.filter(
      (m) => m.status === CompanyMemberStatus.PENDING,
    );
    const activeMembers = allMembers.filter(
      (m) => m.status === CompanyMemberStatus.ACTIVE,
    );

    let revokedPending = 0;
    let deactivatedActive = 0;

    // Cancel excess pending invitations first
    const totalReserved = activeMembers.length + pendingMembers.length;
    if (totalReserved > maxUsers && pendingMembers.length > 0) {
      const excessPendingCount = Math.min(
        totalReserved - maxUsers,
        pendingMembers.length,
      );
      const pendingToRevoke = pendingMembers.slice(0, excessPendingCount);
      for (const pending of pendingToRevoke) {
        await memberRepo.delete(pending.id);
        revokedPending++;
      }
    }

    // Deactivate excess active members if still over limit
    if (activeMembers.length > maxUsers) {
      const excessActiveCount = activeMembers.length - maxUsers;

      const nonAdmins = activeMembers.filter(
        (m) => m.role !== CompanyRole.ADMIN,
      );
      const admins = activeMembers.filter((m) => m.role === CompanyRole.ADMIN);

      const toDeactivate: CompanyMemberOrmEntity[] = [];

      for (const member of nonAdmins) {
        if (toDeactivate.length < excessActiveCount) {
          toDeactivate.push(member);
        }
      }

      // If we still need to deactivate and have more than 1 admin, deactivate newer admins
      if (toDeactivate.length < excessActiveCount && admins.length > 1) {
        // admins is ordered joinedAt DESC, last one is the oldest admin
        const adminsCanDeactivate = admins.slice(0, admins.length - 1);
        for (const admin of adminsCanDeactivate) {
          if (toDeactivate.length < excessActiveCount) {
            toDeactivate.push(admin);
          }
        }
      }

      for (const member of toDeactivate) {
        member.status = CompanyMemberStatus.DEACTIVATED;
        member.deactivationReason = 'PLAN_LIMIT_EXCEEDED';
        member.deactivatedAt = new Date();
        await memberRepo.save(member);
        deactivatedActive++;
      }
    }

    return { revokedPending, deactivatedActive };
  }

  async getActiveAdmin(companyId: string): Promise<CompanyMember | null> {
    return this.companyMemberRepository.findActiveAdminByCompanyId(companyId);
  }
}
