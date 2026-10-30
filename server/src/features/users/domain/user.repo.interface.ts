import { UserType } from './user-type.enum';
import { User } from './user.entity';
import { Gender } from './gender.enum';
import { PaginatedResult } from '@/common/pagination/paginated-results';
import { AuthUserData, UserTokenData } from './user-auth.types';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export type CreateUserParams = {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  phoneNumber: string;
  gender?: Gender;
  dob?: Date;
};

export interface FindUsersOptions {
  page?: number;
  limit?: number;
  order?: 'ASC' | 'DESC';
  search?: string;
  userType?: UserType;
  isBanned?: boolean;
  isEmailVerified?: boolean;
}

export interface IUserRepository {
  create(params: CreateUserParams, tx?: any): Promise<User>;

  findByEmail(email: string): Promise<User | null>;

  findForAuthByEmail(email: string): Promise<AuthUserData | null>;
  findForAuthById(id: string): Promise<AuthUserData | null>;
  findById(id: string): Promise<User | null>;
  findAll(options?: FindUsersOptions): Promise<PaginatedResult<User>>;

  updateRefreshToken(userId: string, hashedToken: string | null): Promise<void>;

  updateProfile(userId: string, data: Partial<User>): Promise<User | null>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
  updateBanStatus(userId: string, isBanned: boolean): Promise<boolean>;
  verifyEmail(userId: string): Promise<void>;

  saveVerifyEmailToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void>;
  findByVerifyEmailToken(token: string): Promise<UserTokenData | null>;
  clearVerifyEmailToken(userId: string): Promise<void>;

  saveResetToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  findByResetToken(token: string): Promise<UserTokenData | null>;
  clearResetToken(userId: string): Promise<void>;

  saveInviteToken(
    userId: string,
    token: string,
    expiresAt: Date,
    tx?: any,
  ): Promise<void>;
  findByInviteToken(token: string): Promise<UserTokenData | null>;
  clearInviteToken(userId: string): Promise<void>;
}
