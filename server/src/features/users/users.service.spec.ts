import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { USER_REPOSITORY } from './domain/user.repo.interface';
import { STORAGE_SERVICE } from '@/integrations/storage/storage.interface';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: USER_REPOSITORY,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findForAuthByEmail: jest.fn(),
            findForAuthById: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            updateRefreshToken: jest.fn(),
            updateProfile: jest.fn(),
            updatePassword: jest.fn(),
            updateBanStatus: jest.fn(),
            verifyEmail: jest.fn(),
          },
        },
        {
          provide: STORAGE_SERVICE,
          useValue: {
            uploadImage: jest.fn(),
            deleteFile: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
