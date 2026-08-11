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
  createdAt!: Date;
  updatedAt!: Date;
}
