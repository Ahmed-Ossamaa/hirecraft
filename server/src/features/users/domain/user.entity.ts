import { UserType } from './user-type.enum';
import { Gender } from './gender.enum';
import { Exclude } from 'class-transformer';
import { ApiHideProperty } from '@nestjs/swagger';

export class User {
  id!: string;
  email!: string;
  @Exclude()
  @ApiHideProperty()
  passwordHash!: string;

  @Exclude()
  @ApiHideProperty()
  hashedRefreshToken?: string | null;
  firstName!: string;
  lastName!: string;
  userType!: UserType;
  phoneNumber!: string;
  gender?: Gender;
  dob?: Date;
  avatarURL?: string | null;
  avatarPublicId?: string | null;
  isBanned!: boolean;
  isEmailVerified!: boolean;
  @Exclude()
  @ApiHideProperty()
  verifyEmailToken?: string | null;

  @Exclude()
  @ApiHideProperty()
  verifyEmailTokenExpiresAt?: Date | null;

  @Exclude()
  @ApiHideProperty()
  resetPasswordToken?: string | null;

  @Exclude()
  @ApiHideProperty()
  resetPasswordExpiresAt?: Date | null;

  @Exclude()
  @ApiHideProperty()
  inviteToken?: string | null;

  @Exclude()
  @ApiHideProperty()
  inviteTokenExpiresAt?: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}
