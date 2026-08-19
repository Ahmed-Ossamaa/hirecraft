import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  IUserRepository,
  CreateUserParams,
} from '../domain/user.repo.interface';
import { User } from '../domain/user.entity';
import { UserOrmEntity } from './user.orm-entity';

@Injectable()
export class UserTypeormRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async create(params: CreateUserParams, tx?: EntityManager): Promise<User> {
    const manager = tx || this.repository.manager;
    const ormEntity = manager.create(UserOrmEntity, params);
    const savedEntity = await manager.save(ormEntity);
    return this.mapToDomain(savedEntity);
  }

  async findByEmail(email: string): Promise<User | null> {
    const ormEntity = await this.repository.findOne({ where: { email } });
    if (!ormEntity) return null;
    return this.mapToDomain(ormEntity);
  }

  async findForAuthByEmail(email: string): Promise<User | null> {
    const ormEntity = await this.repository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect(['user.passwordHash', 'user.hashedRefreshToken'])
      .getOne();

    if (!ormEntity) return null;
    return this.mapToDomain(ormEntity);
  }

  async findForAuthById(id: string): Promise<User | null> {
    const ormEntity = await this.repository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .addSelect(['user.hashedRefreshToken'])
      .getOne();

    if (!ormEntity) return null;
    return this.mapToDomain(ormEntity);
  }

  async updateRefreshToken(
    userId: string,
    hashedToken: string | null,
  ): Promise<void> {
    await this.repository.update(userId, { hashedRefreshToken: hashedToken });
  }

  async updateProfile(
    userId: string,
    data: Partial<User>,
  ): Promise<User | null> {
    await this.repository.update(userId, data);
    return this.findById(userId);
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.repository.update(userId, { passwordHash });
  }

  async updateBanStatus(userId: string, isBanned: boolean): Promise<void> {
    await this.repository.update(userId, { isBanned });
  }

  async verifyEmail(userId: string): Promise<void> {
    await this.repository.update(userId, { isEmailVerified: true });
  }

  async saveVerifyEmailToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.repository.update(userId, {
      verifyEmailToken: token,
      verifyEmailTokenExpiresAt: expiresAt,
    });
  }

  async clearVerifyEmailToken(userId: string): Promise<void> {
    await this.repository.update(userId, {
      verifyEmailToken: null,
      verifyEmailTokenExpiresAt: null,
    });
  }

  async findByVerifyEmailToken(token: string): Promise<User | null> {
    const ormEntity = await this.repository
      .createQueryBuilder('user')
      .where('user.verifyEmailToken = :token', { token })
      .addSelect(['user.verifyEmailToken', 'user.verifyEmailTokenExpiresAt'])
      .getOne();

    if (!ormEntity) return null;
    return this.mapToDomain(ormEntity);
  }

  async saveResetToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.repository.update(userId, {
      resetPasswordToken: token,
      resetPasswordExpiresAt: expiresAt,
    });
  }

  async clearResetToken(userId: string): Promise<void> {
    await this.repository.update(userId, {
      resetPasswordToken: null,
      resetPasswordExpiresAt: null,
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    const ormEntity = await this.repository
      .createQueryBuilder('user')
      .where('user.resetPasswordToken = :token', { token })
      .addSelect(['user.resetPasswordToken', 'user.resetPasswordExpiresAt'])
      .getOne();

    if (!ormEntity) return null;
    return this.mapToDomain(ormEntity);
  }

  async saveInviteToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.repository.update(userId, {
      inviteToken: token,
      inviteTokenExpiresAt: expiresAt,
    });
  }

  async clearInviteToken(userId: string): Promise<void> {
    await this.repository.update(userId, {
      inviteToken: null,
      inviteTokenExpiresAt: null,
    });
  }

  async findByInviteToken(token: string): Promise<User | null> {
    const ormEntity = await this.repository
      .createQueryBuilder('user')
      .where('user.inviteToken = :token', { token })
      .addSelect(['user.inviteToken', 'user.inviteTokenExpiresAt'])
      .getOne();

    if (!ormEntity) return null;
    return this.mapToDomain(ormEntity);
  }

  async findById(id: string): Promise<User | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    if (!ormEntity) return null;
    return this.mapToDomain(ormEntity);
  }

  // convert ORM entity -> Domain entity
  private mapToDomain(orm: UserOrmEntity): User {
    const user = new User();
    Object.assign(user, orm);
    return user;
  }
}
