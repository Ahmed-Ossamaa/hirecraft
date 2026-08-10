import { UserType } from '@/features/users/domain/user-type.enum';

export type JwtUser = {
  id: string;
  email: string;
  userType: UserType;
};
