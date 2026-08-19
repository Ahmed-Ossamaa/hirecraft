import { UserType } from '@/features/users/domain/user-type.enum';

export type JwtPayload = {
  sub: string;
  email: string;
  userType: UserType;
  companyId?: string;
  role?: string;
};
export type JwtUser = {
  id: string;
  email: string;
  userType: UserType;
  companyId?: string;
  role?: string;
};
