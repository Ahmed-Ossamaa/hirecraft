import { UserType } from './user-type.enum';

export class User {
  id!: string;
  email!: string;
  passwordHash!: string;
  hashedRefreshToken?: string | null;
  firstName!: string;
  lastName!: string;
  userType!: UserType;
  phoneNumber!: string;
  gender?: string;
  dob?: Date;
  avatarURL?: string;
  isBanned!: boolean;
  isEmailVerified!: boolean;
  verifyEmailToken?: string | null;
  verifyEmailTokenExpiresAt?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpiresAt?: Date | null;
  inviteToken?: string | null;
  inviteTokenExpiresAt?: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}
