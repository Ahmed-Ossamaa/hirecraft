import { User } from './user.entity';

export interface AuthUserData {
  user: User;
  passwordHash: string;
  hashedRefreshToken: string | null;
}

export interface UserTokenData {
  user: User;
  tokenExpiresAt: Date | null;
}
