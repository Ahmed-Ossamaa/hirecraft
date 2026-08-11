import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CompanyRole } from '../company-members/domain/company-role.enum';
import { SignupDto } from './dto/signup.dto';
import { UserType } from '../users/domain/user-type.enum';
import { UsersService } from '../users/users.service';
import { DataSource, EntityManager } from 'typeorm';
import { Company } from '../companies/domain/company.entity';
import { CompaniesService } from '../companies/companies.service';
import { CompanyMembersService } from '../company-members/company-members.service';
import jwtConfig from '../../config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/domain/user.entity';
import { type ConfigType } from '@nestjs/config';
import { CreateCompanyParams } from '../companies/domain/company.repo.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly companiesService: CompaniesService,
    private readonly companyMembersService: CompanyMembersService,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly config: ConfigType<typeof jwtConfig>,
  ) {}

  async signup(dto: SignupDto, companyData?: CreateCompanyParams) {
    await this.ensureEmailIsUnique(dto.email);

    const passwordHash = await this.hashPassword(dto.password);

    return this.dataSource.transaction(async (tx: EntityManager) => {
      const user = await this.usersService.createUser(
        {
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          userType: dto.userType,
          phoneNumber: dto.phoneNumber,
        },
        tx,
      );

      let company: Company | null = null;

      if (dto.userType === UserType.EMPLOYER && companyData) {
        company = await this.setupEmployer(user.id, companyData, tx);
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _, ...safeUser } = user;

      return { user: safeUser, company };
    });
  }

  async login(dto: LoginDto) {
    const user = await this.validateUserCredentials(dto.email, dto.password);
    const tokens = await this.getTokens(user.id, user.email, user.userType);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, hashedRefreshToken: __, ...safeUser } = user;

    return {
      user: safeUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findForAuthById(userId);

    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );
    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access Denied');
    }

    // Generate new tokens
    const tokens = await this.getTokens(user.id, user.email, user.userType);

    // Rotate the refresh token in the database
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.updateRefreshToken(userId, null);
  }

  // ------------------------------

  private async validateUserCredentials(
    email: string,
    pass: string,
  ): Promise<User> {
    const user = await this.usersService.findForAuthByEmail(email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
  private async getTokens(userId: string, email: string, userType: string) {
    const jwtPayload = { sub: userId, email, userType };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.accessSecret,
        expiresIn: this.config.accessExpires,
      }),

      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.refreshSecret,
        expiresIn: this.config.refreshExpires,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ) {
    if (refreshToken) {
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      await this.usersService.updateRefreshToken(userId, hashedRefreshToken);
    } else {
      await this.usersService.updateRefreshToken(userId, null);
    }
  }

  private async ensureEmailIsUnique(email: string): Promise<void> {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * @description Creates a company and links the user to it
   */
  private async setupEmployer(
    userId: string,
    companyData: CreateCompanyParams,
    tx: EntityManager,
  ): Promise<Company> {
    //Create Company
    const company = await this.companiesService.createCompany(companyData, tx);

    //Link the User to the Company as ADMIN
    await this.companyMembersService.addMember(
      {
        userId: userId,
        companyId: company.id,
        role: CompanyRole.ADMIN,
      },
      tx,
    );

    return company;
  }
}
