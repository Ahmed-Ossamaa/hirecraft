import { Test, TestingModule } from '@nestjs/testing';
import { CompanyMembersController } from './company-members.controller';
import { CompanyMembersService } from './company-members.service';
import { CompanyRole } from './domain/company-role.enum';
import { UserType } from '../users/domain/user-type.enum';
import { CompanyMember } from './domain/company-member.entity';

describe('CompanyMembersController', () => {
  let controller: CompanyMembersController;
  let serviceMock: jest.Mocked<Partial<CompanyMembersService>>;

  beforeEach(async () => {
    serviceMock = {
      getMembers: jest.fn(),
      inviteUser: jest.fn(),
      removeMember: jest.fn(),
      updateMemberRole: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyMembersController],
      providers: [{ provide: CompanyMembersService, useValue: serviceMock }],
    }).compile();

    controller = module.get<CompanyMembersController>(CompanyMembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateMemberRole', () => {
    it('should call companyMembersService.updateMemberRole with correct parameters', async () => {
      const mockMember = new CompanyMember();
      mockMember.id = 'member-1';
      mockMember.userId = 'user-2';
      mockMember.role = CompanyRole.ADMIN;

      (serviceMock.updateMemberRole as jest.Mock).mockResolvedValue(mockMember);

      const result = await controller.updateMemberRole(
        'user-2',
        { role: CompanyRole.ADMIN },
        'admin-1',
        UserType.EMPLOYER,
        'company-1',
        CompanyRole.ADMIN,
      );

      expect(serviceMock.updateMemberRole).toHaveBeenCalledWith(
        'user-2',
        CompanyRole.ADMIN,
        UserType.EMPLOYER,
        'admin-1',
        'company-1',
        CompanyRole.ADMIN,
      );
      expect(result).toEqual(mockMember);
    });
  });
});
