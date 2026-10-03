/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { CompanyMembersService } from './company-members.service';
import { COMPANY_MEMBER_REPOSITORY } from './domain/company-member.repo.interface';
import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import appConfig from '@/config/app.config';
import { CompanyRole } from './domain/company-role.enum';
import { UserType } from '../users/domain/user-type.enum';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CompanyMember } from './domain/company-member.entity';
import { CompanyMemberStatus } from './domain/company-member-status.enum';

describe('CompanyMembersService', () => {
  let service: CompanyMembersService;
  let repoMock: Record<string, any>;
  let dataSourceMock: Record<string, any>;

  const mockActiveMember = (
    userId: string,
    companyId: string,
    role: CompanyRole,
  ): CompanyMember => {
    const m = new CompanyMember();
    m.id = 'member-1';
    m.userId = userId;
    m.companyId = companyId;
    m.role = role;
    m.status = CompanyMemberStatus.ACTIVE;
    m.joinedAt = new Date();
    return m;
  };

  beforeEach(async () => {
    repoMock = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      findActiveByUserId: jest.fn(),
      findByUserIdAndCompanyId: jest.fn(),
      findAllByCompanyId: jest.fn(),
      updateRole: jest.fn(),
      countActiveAdminsInCompany: jest.fn(),
      remove: jest.fn(),
    };

    dataSourceMock = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      transaction: jest.fn((cb) => cb({})),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyMembersService,
        { provide: COMPANY_MEMBER_REPOSITORY, useValue: repoMock },
        { provide: appConfig.KEY, useValue: { clientURL: 'http://localhost' } },
        { provide: UsersService, useValue: {} },
        { provide: CompaniesService, useValue: {} },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        { provide: DataSource, useValue: dataSourceMock },
      ],
    }).compile();

    service = module.get<CompanyMembersService>(CompanyMembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateMemberRole', () => {
    const companyId = 'company-123';
    const adminId = 'admin-user-1';
    const staffId = 'staff-user-2';
    // const otherCompanyAdminId = 'admin-other-company';

    it("PLATFORM_ADMIN can change a user's active membership role", async () => {
      const activeMember = mockActiveMember(
        staffId,
        companyId,
        CompanyRole.STAFF,
      );
      const updatedMember = {
        ...activeMember,
        role: CompanyRole.HIRING_MANAGER,
      };

      repoMock.findActiveByUserId.mockResolvedValue(activeMember);
      repoMock.updateRole.mockResolvedValue(updatedMember);

      const result = await service.updateMemberRole(
        staffId,
        CompanyRole.HIRING_MANAGER,
        UserType.PLATFORM_ADMIN,
        'platform-admin-id',
      );

      expect(repoMock.findActiveByUserId).toHaveBeenCalledWith(
        staffId,
        expect.anything(),
      );
      expect(repoMock.updateRole).toHaveBeenCalledWith(
        staffId,
        CompanyRole.HIRING_MANAGER,
        expect.anything(),
      );
      expect(result.role).toEqual(CompanyRole.HIRING_MANAGER);
    });

    it('Company ADMIN can change another member role within their own company', async () => {
      const activeMember = mockActiveMember(
        staffId,
        companyId,
        CompanyRole.STAFF,
      );
      const updatedMember = { ...activeMember, role: CompanyRole.ADMIN };

      repoMock.findActiveByUserId.mockResolvedValue(activeMember);
      repoMock.updateRole.mockResolvedValue(updatedMember);

      const result = await service.updateMemberRole(
        staffId,
        CompanyRole.ADMIN,
        UserType.EMPLOYER,
        adminId,
        companyId,
        CompanyRole.ADMIN,
      );

      expect(result.role).toEqual(CompanyRole.ADMIN);
    });

    it('Company ADMIN cannot change a member belonging to another company', async () => {
      const activeMember = mockActiveMember(
        staffId,
        'other-company-id',
        CompanyRole.STAFF,
      );
      repoMock.findActiveByUserId.mockResolvedValue(activeMember);

      await expect(
        service.updateMemberRole(
          staffId,
          CompanyRole.ADMIN,
          UserType.EMPLOYER,
          adminId,
          companyId,
          CompanyRole.ADMIN,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Non-ADMIN employer (HIRING_MANAGER/STAFF) cannot change member roles', async () => {
      const activeMember = mockActiveMember(
        staffId,
        companyId,
        CompanyRole.STAFF,
      );
      repoMock.findActiveByUserId.mockResolvedValue(activeMember);

      await expect(
        service.updateMemberRole(
          staffId,
          CompanyRole.ADMIN,
          UserType.EMPLOYER,
          'manager-id',
          companyId,
          CompanyRole.HIRING_MANAGER,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Company ADMIN cannot change their own role (self-role change)', async () => {
      const activeMember = mockActiveMember(
        adminId,
        companyId,
        CompanyRole.ADMIN,
      );
      repoMock.findActiveByUserId.mockResolvedValue(activeMember);

      await expect(
        service.updateMemberRole(
          adminId,
          CompanyRole.STAFF,
          UserType.EMPLOYER,
          adminId,
          companyId,
          CompanyRole.ADMIN,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Cannot demote the last active admin of a company (Company ADMIN)', async () => {
      const targetAdminId = 'admin-user-2';
      const activeMember = mockActiveMember(
        targetAdminId,
        companyId,
        CompanyRole.ADMIN,
      );
      repoMock.findActiveByUserId.mockResolvedValue(activeMember);
      repoMock.countActiveAdminsInCompany.mockResolvedValue(1);

      await expect(
        service.updateMemberRole(
          targetAdminId,
          CompanyRole.STAFF,
          UserType.EMPLOYER,
          adminId,
          companyId,
          CompanyRole.ADMIN,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Cannot demote the last active admin of a company (PLATFORM_ADMIN)', async () => {
      const targetAdminId = 'admin-user-2';
      const activeMember = mockActiveMember(
        targetAdminId,
        companyId,
        CompanyRole.ADMIN,
      );
      repoMock.findActiveByUserId.mockResolvedValue(activeMember);
      repoMock.countActiveAdminsInCompany.mockResolvedValue(1);

      await expect(
        service.updateMemberRole(
          targetAdminId,
          CompanyRole.STAFF,
          UserType.PLATFORM_ADMIN,
          'platform-admin-id',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Can demote an ADMIN if another active admin remains in the company', async () => {
      const targetAdminId = 'admin-user-2';
      const activeMember = mockActiveMember(
        targetAdminId,
        companyId,
        CompanyRole.ADMIN,
      );
      const updatedMember = { ...activeMember, role: CompanyRole.STAFF };

      repoMock.findActiveByUserId.mockResolvedValue(activeMember);
      repoMock.countActiveAdminsInCompany.mockResolvedValue(2);
      repoMock.updateRole.mockResolvedValue(updatedMember);

      const result = await service.updateMemberRole(
        targetAdminId,
        CompanyRole.STAFF,
        UserType.EMPLOYER,
        adminId,
        companyId,
        CompanyRole.ADMIN,
      );

      expect(result.role).toEqual(CompanyRole.STAFF);
    });

    it('Throws NotFoundException if user has no active company membership', async () => {
      repoMock.findActiveByUserId.mockResolvedValue(null);

      await expect(
        service.updateMemberRole(
          'user-no-active',
          CompanyRole.STAFF,
          UserType.PLATFORM_ADMIN,
          'platform-admin-id',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
