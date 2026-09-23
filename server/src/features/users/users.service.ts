import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  type IUserRepository,
  USER_REPOSITORY,
  CreateUserParams,
  FindUsersOptions,
} from './domain/user.repo.interface';
import { PaginatedResult } from '@/common/pagination/paginated-results';
import {
  type IStorageService,
  STORAGE_SERVICE,
} from '@/integrations/storage/storage.interface';
import { User } from './domain/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
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

  async updatePassword(userId: string, hash: string): Promise<void> {
    await this.userRepository.updatePassword(userId, hash);
  }

  async saveResetToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.userRepository.saveResetToken(userId, token, expiresAt);
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.userRepository.findByResetToken(token);
  }

  async clearResetToken(userId: string): Promise<void> {
    await this.userRepository.clearResetToken(userId);
  }

  async saveInviteToken(
    userId: string,
    token: string,
    expiresAt: Date,
    tx?: any,
  ): Promise<void> {
    await this.userRepository.saveInviteToken(userId, token, expiresAt, tx);
  }

  async findByInviteToken(token: string): Promise<User | null> {
    return this.userRepository.findByInviteToken(token);
  }

  async clearInviteToken(userId: string): Promise<void> {
    await this.userRepository.clearInviteToken(userId);
  }

  async saveVerifyEmailToken(
    userId: string,
    hash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.userRepository.saveVerifyEmailToken(userId, hash, expiresAt);
  }

  async findByVerifyEmailToken(hash: string): Promise<User | null> {
    return this.userRepository.findByVerifyEmailToken(hash);
  }

  async clearVerifyEmailToken(userId: string): Promise<void> {
    await this.userRepository.clearVerifyEmailToken(userId);
  }

  async verifyEmail(userId: string): Promise<void> {
    await this.userRepository.verifyEmail(userId);
  }

  async banUser(userId: string, isBanned: boolean): Promise<void> {
    const updated = await this.userRepository.updateBanStatus(userId, isBanned);
    if (!updated) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
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

  async findAllUsers(
    options?: FindUsersOptions,
  ): Promise<PaginatedResult<User>> {
    return this.userRepository.findAll(options);
  }
}
