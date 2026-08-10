import { Injectable, Inject } from '@nestjs/common';
import {
  type IUserRepository,
  USER_REPOSITORY,
  CreateUserParams,
} from './domain/user.repo.interface';
import { User } from './domain/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async createUser(params: CreateUserParams, tx?: any): Promise<User> {
    return this.userRepository.create(params, tx);
  }

  async updateRefreshToken(
    userId: string,
    hashedToken: string | null,
  ): Promise<void> {
    await this.userRepository.updateRefreshToken(userId, hashedToken);
  }

  async findForAuthById(id: string): Promise<User | null> {
    return this.userRepository.findForAuthById(id);
  }

  async findForAuthByEmail(email: string): Promise<User | null> {
    return this.userRepository.findForAuthByEmail(email);
  }
}
