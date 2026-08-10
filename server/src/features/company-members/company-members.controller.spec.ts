import { Test, TestingModule } from '@nestjs/testing';
import { CompanyMembersController } from './company-members.controller';
import { CompanyMembersService } from './company-members.service';

describe('CompanyMembersController', () => {
  let controller: CompanyMembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyMembersController],
      providers: [CompanyMembersService],
    }).compile();

    controller = module.get<CompanyMembersController>(CompanyMembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
