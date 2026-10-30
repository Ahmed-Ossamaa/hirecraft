import { UserType } from './user-type.enum';
import { Gender } from './gender.enum';
import { Exclude } from 'class-transformer';
import { ApiHideProperty } from '@nestjs/swagger';

export class User {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  userType!: UserType;
  phoneNumber!: string;
  gender?: Gender;
  dob?: Date;
  avatarURL?: string | null;

  @Exclude()
  @ApiHideProperty()
  avatarPublicId?: string | null;

  isBanned!: boolean;
  isEmailVerified!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
