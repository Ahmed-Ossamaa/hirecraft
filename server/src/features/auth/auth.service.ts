import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Inject,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import appConfig from '@/config/app.config';
import {
  PasswordResetRequestedEvent,
  UserVerificationRequestedEvent,
} from '@/integrations/mail/mail.events';
import { ConfirmResetPasswordDto } from './dto/confirm-reset-password.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { ChangePasswordDto } from '../users/dto/change-password.dto';
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
import { JwtUser, JwtPayload } from '@/common/types/jwt.types';

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
    @Inject(appConfig.KEY)
    private readonly appCfg: ConfigType<typeof appConfig>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async signup(dto: SignupDto, companyData?: CreateCompanyParams) {
    await this.ensureEmailIsUnique(dto.email);

    const passwordHash = await this.hashPassword(dto.password);

    const result = await this.dataSource.transaction(
      async (tx: EntityManager) => {
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

        return { user, company };
      },
    );

    await this.requestEmailVerification(result.user.id);

    return {
      success: true,
      message:
        'Signup successful. Please check your email to verify your account.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.validateUserCredentials(dto.email, dto.password);

    if (!user.isEmailVerified) {
      throw new ForbiddenException(
        'Email is not verified. Please check your inbox.',
      );
    }

    const tokens = await this.issueTokens(user);

    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.config.refreshSecret,
        },
      );
      const userId = payload.sub;

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

      const tokens = await this.issueTokens(user);

      await this.storeRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch {
      throw new ForbiddenException('Access Denied');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.storeRefreshToken(userId, null);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersService.findForAuthById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isMatch) {
      throw new UnauthorizedException('Incorrect current password');
    }

    const hash = await bcrypt.hash(dto.newPassword, 10);

    await this.usersService.updatePassword(userId, hash);
  }

  async resetPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour

    await this.usersService.saveResetToken(user.id, hash, expiresAt);

    const clientUrl = this.appCfg.clientURL;
    const resetLink = `${clientUrl}/reset-password?token=${token}`;

    this.eventEmitter.emit(
      'password.reset.requested',
      new PasswordResetRequestedEvent(
        user.email,
        user.firstName,
        user.lastName,
        resetLink,
      ),
    );
  }

  async confirmResetPassword(dto: ConfirmResetPasswordDto): Promise<void> {
    const tokenHash = crypto
      .createHash('sha256')
      .update(dto.token)
      .digest('hex');
    const user = await this.usersService.findByResetToken(tokenHash);
    if (!user || !user.resetPasswordExpiresAt) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (user.resetPasswordExpiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hash = await bcrypt.hash(dto.newPassword, 10);

    await this.usersService.updatePassword(user.id, hash);
    await this.usersService.clearResetToken(user.id);
  }

  async acceptInvite(dto: AcceptInviteDto): Promise<void> {
    const tokenHash = crypto
      .createHash('sha256')
      .update(dto.token)
      .digest('hex');
    const user = await this.usersService.findByInviteToken(tokenHash);
    if (!user || !user.inviteTokenExpiresAt) {
      throw new UnauthorizedException('Invalid or expired invite token');
    }

    if (user.inviteTokenExpiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired invite token');
    }

    const hash = await bcrypt.hash(dto.newPassword, 10);

    await this.usersService.updatePassword(user.id, hash);
    await this.usersService.verifyEmail(user.id);
    await this.usersService.clearInviteToken(user.id);
  }

  async requestEmailVerification(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user || user.isEmailVerified) return;

    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    await this.usersService.saveVerifyEmailToken(userId, hash, expiresAt);

    const clientUrl = this.appCfg.clientURL;
    const verifyLink = `${clientUrl}/verify-email?token=${token}`;

    this.eventEmitter.emit(
      'user.verification.requested',
      new UserVerificationRequestedEvent(
        user.email,
        user.firstName,
        user.lastName,
        verifyLink,
      ),
    );
  }

  async resendVerification(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.isEmailVerified) {
      return;
    }
    await this.requestEmailVerification(user.id);
  }

  async verifyEmailWithToken(token: string): Promise<void> {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.usersService.findByVerifyEmailToken(hash);
    if (!user || !user.verifyEmailTokenExpiresAt) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    if (user.verifyEmailTokenExpiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    await this.usersService.verifyEmail(user.id);
    await this.usersService.clearVerifyEmailToken(user.id);
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

  private async getTokens(user: JwtUser) {
    const jwtPayload = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
      companyId: user.companyId,
      role: user.role,
    };
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

  private async issueTokens(user: User) {
    let companyId: string | undefined;
    let role: string | undefined;

    if (user.userType === UserType.EMPLOYER) {
      const membership = await this.companyMembersService.getMembershipByUserId(
        user.id,
      );

      if (membership && membership.isActive) {
        companyId = membership.companyId;
        role = membership.role;
      }
    }

    return this.getTokens({
      id: user.id,
      email: user.email,
      userType: user.userType,
      companyId,
      role,
    });
  }

  private async storeRefreshToken(userId: string, refreshToken: string | null) {
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
