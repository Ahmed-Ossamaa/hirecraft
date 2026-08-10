import { UserType } from './user-type.enum';
import { User } from './user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export type CreateUserParams = {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  phoneNumber: string;
  gender?: string;
  dob?: Date;
};

export interface IUserRepository {
  create(params: CreateUserParams, tx?: any): Promise<User>;

  findByEmail(email: string): Promise<User | null>;

  findForAuthByEmail(email: string): Promise<User | null>;
  findForAuthById(id: string): Promise<User | null>;

  updateRefreshToken(userId: string, hashedToken: string | null): Promise<void>;

  //updatePassword()

  //updateProfile()
}
