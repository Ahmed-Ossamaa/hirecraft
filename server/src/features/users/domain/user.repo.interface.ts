import { UserType } from './user-type.enum';
import { User } from './user.entity';

import { Gender } from './gender.enum';

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

export interface IUserRepository {
  create(params: CreateUserParams, tx?: any): Promise<User>;

  findByEmail(email: string): Promise<User | null>;

  findForAuthByEmail(email: string): Promise<User | null>;
  findForAuthById(id: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;

  updateRefreshToken(userId: string, hashedToken: string | null): Promise<void>;

  updateProfile(userId: string, data: Partial<User>): Promise<User | null>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
  updateBanStatus(userId: string, isBanned: boolean): Promise<void>;
  verifyEmail(userId: string): Promise<void>;

  saveVerifyEmailToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void>;
  findByVerifyEmailToken(token: string): Promise<User | null>;
  clearVerifyEmailToken(userId: string): Promise<void>;

  saveResetToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  findByResetToken(token: string): Promise<User | null>;
  clearResetToken(userId: string): Promise<void>;

  saveInviteToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void>;
  findByInviteToken(token: string): Promise<User | null>;
  clearInviteToken(userId: string): Promise<void>;
}
