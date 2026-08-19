import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  type IUserRepository,
  USER_REPOSITORY,
  CreateUserParams,
} from './domain/user.repo.interface';
import {
  type IStorageService,
  STORAGE_SERVICE,
} from '@/integrations/storage/storage.interface';
import { User } from './domain/user.entity';
import { UserType } from './domain/user-type.enum';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfirmResetPasswordDto } from '../auth/dto/confirm-reset-password.dto';
import { AcceptInviteDto } from '../auth/dto/accept-invite.dto';
import { PasswordResetRequestedEvent } from '@/integrations/mail/mail.events';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import appConfig from '@/config/app.config';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
    private readonly eventEmitter: EventEmitter2,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async createUser(params: CreateUserParams, tx?: any): Promise<User> {
    return this.userRepository.create(params, tx);
  }

  async updateRefreshToken(
    userId: string,
    hashedToken: string | null,
  ): Promise<void> {
    await this.userRepository.updateRefreshToken(userId, hashedToken);
  }

  async findForAuthById(id: string): Promise<User | null> {
    return this.userRepository.findForAuthById(id);
  }

  async findForAuthByEmail(email: string): Promise<User | null> {
    return this.userRepository.findForAuthByEmail(email);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const updated = await this.userRepository.updateProfile(userId, dto);
    if (!updated) {
      throw new NotFoundException('User not found');
    }
    return updated;
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findForAuthById(userId);
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

    await this.userRepository.updatePassword(userId, hash);
  }

  async resetPassword(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour

    await this.userRepository.saveResetToken(user.id, token, expiresAt);

    const clientUrl = this.config.clientURL;
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
    const user = await this.userRepository.findByResetToken(dto.token);
    if (!user || !user.resetPasswordExpiresAt) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (user.resetPasswordExpiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hash = await bcrypt.hash(dto.newPassword, 10);

    await this.userRepository.updatePassword(user.id, hash);
    await this.userRepository.clearResetToken(user.id);
  }

  async createInvitedUser(
    email: string,
    firstName: string,
    lastName: string,
    userType: UserType,
  ): Promise<{ user: User; inviteToken: string }> {
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    const user = await this.userRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
      userType,
      phoneNumber: '',
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.userRepository.saveInviteToken(user.id, token, expiresAt);

    return { user, inviteToken: token };
  }

  async acceptInvite(dto: AcceptInviteDto): Promise<void> {
    const user = await this.userRepository.findByInviteToken(dto.token);
    if (!user || !user.inviteTokenExpiresAt) {
      throw new UnauthorizedException('Invalid or expired invite token');
    }

    if (user.inviteTokenExpiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired invite token');
    }

    const hash = await bcrypt.hash(dto.newPassword, 10);

    await this.userRepository.updatePassword(user.id, hash);
    await this.userRepository.verifyEmail(user.id);
    await this.userRepository.clearInviteToken(user.id);
  }

  async banUser(userId: string, isBanned: boolean): Promise<void> {
    await this.userRepository.updateBanStatus(userId, isBanned);
  }

  async verifyEmailWithToken(token: string): Promise<void> {
    const user = await this.userRepository.findByVerifyEmailToken(token);
    if (!user || !user.verifyEmailTokenExpiresAt) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    if (user.verifyEmailTokenExpiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    await this.userRepository.verifyEmail(user.id);
    await this.userRepository.clearVerifyEmailToken(user.id);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<User> {
    const user = await this.userRepository.findForAuthById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const publicId = `user_${userId}_avatar`;
    const result = await this.storageService.uploadImage(file, {
      folder: 'avatars',
      type: 'avatar',
      publicId,
      overwrite: true,
    });

    const updatedUser = await this.userRepository.updateProfile(userId, {
      avatarURL: result.url,
      avatarPublicId: result.publicId,
    });

    return updatedUser!;
  }

  async removeAvatar(userId: string): Promise<User> {
    const user = await this.userRepository.findForAuthById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.avatarPublicId) {
      await this.storageService.deleteFile(user.avatarPublicId);
    }

    const updatedUser = await this.userRepository.updateProfile(userId, {
      avatarURL: null,
      avatarPublicId: null,
    });

    return updatedUser!;
  }
}
