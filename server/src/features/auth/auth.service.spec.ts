import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';
import { CompanyMembersService } from '../company-members/company-members.service';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../../config/jwt.config';
import appConfig from '@/config/app.config';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: CompaniesService,
          useValue: {},
        },
        {
          provide: CompanyMembersService,
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: jwtConfig.KEY,
          useValue: {
            accessSecret: 'access',
            accessExpires: '15m',
            refreshSecret: 'refresh',
            refreshExpires: '7d',
          },
        },
        {
          provide: appConfig.KEY,
          useValue: {},
        },
        {
          provide: EventEmitter2,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
