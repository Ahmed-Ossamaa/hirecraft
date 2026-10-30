import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  IUserRepository,
  CreateUserParams,
  FindUsersOptions,
} from '../domain/user.repo.interface';
import { User } from '../domain/user.entity';
import { AuthUserData, UserTokenData } from '../domain/user-auth.types';
import { UserOrmEntity } from './user.orm-entity';
import { PaginatedResult } from '@/common/pagination/paginated-results';

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

  async findForAuthByEmail(email: string): Promise<AuthUserData | null> {
    const ormEntity = await this.repository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect(['user.passwordHash', 'user.hashedRefreshToken'])
      .getOne();

    if (!ormEntity) return null;
    return {
      user: this.mapToDomain(ormEntity),
      passwordHash: ormEntity.passwordHash,
      hashedRefreshToken: ormEntity.hashedRefreshToken ?? null,
    };
  }

  async findForAuthById(id: string): Promise<AuthUserData | null> {
    const ormEntity = await this.repository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .addSelect(['user.passwordHash', 'user.hashedRefreshToken'])
      .getOne();

    if (!ormEntity) return null;
    return {
      user: this.mapToDomain(ormEntity),
      passwordHash: ormEntity.passwordHash,
      hashedRefreshToken: ormEntity.hashedRefreshToken ?? null,
    };
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
    const result = await this.repository
      .createQueryBuilder()
      .update(UserOrmEntity)
      .set(data)
      .where('id = :userId', { userId })
      .returning('*')
      .execute();

    const rawRows = result.raw as UserOrmEntity[];
    if (!rawRows || !rawRows[0]) return null;

    return this.mapToDomain(rawRows[0]);
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.repository.update(userId, { passwordHash });
  }

  async updateBanStatus(userId: string, isBanned: boolean): Promise<boolean> {
    const result = await this.repository.update(userId, { isBanned });
    return (result.affected ?? 0) > 0;
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
      hashedVerifyEmailToken: token,
      verifyEmailTokenExpiresAt: expiresAt,
    });
  }

  async clearVerifyEmailToken(userId: string): Promise<void> {
    await this.repository.update(userId, {
      hashedVerifyEmailToken: null,
      verifyEmailTokenExpiresAt: null,
    });
  }

  async findByVerifyEmailToken(token: string): Promise<UserTokenData | null> {
    const ormEntity = await this.repository
      .createQueryBuilder('user')
      .where('user.hashedVerifyEmailToken = :token', { token })
      .addSelect([
        'user.hashedVerifyEmailToken',
        'user.verifyEmailTokenExpiresAt',
      ])
      .getOne();

    if (!ormEntity) return null;
    return {
      user: this.mapToDomain(ormEntity),
      tokenExpiresAt: ormEntity.verifyEmailTokenExpiresAt ?? null,
    };
  }

  async saveResetToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.repository.update(userId, {
      hashedResetPasswordToken: token,
      resetPasswordExpiresAt: expiresAt,
    });
  }

  async clearResetToken(userId: string): Promise<void> {
    await this.repository.update(userId, {
      hashedResetPasswordToken: null,
      resetPasswordExpiresAt: null,
    });
  }

  async findByResetToken(token: string): Promise<UserTokenData | null> {
    const ormEntity = await this.repository
      .createQueryBuilder('user')
      .where('user.hashedResetPasswordToken = :token', { token })
      .addSelect([
        'user.hashedResetPasswordToken',
        'user.resetPasswordExpiresAt',
      ])
      .getOne();

    if (!ormEntity) return null;
    return {
      user: this.mapToDomain(ormEntity),
      tokenExpiresAt: ormEntity.resetPasswordExpiresAt ?? null,
    };
  }

  async saveInviteToken(
    userId: string,
    token: string,
    expiresAt: Date,
    tx?: EntityManager,
  ): Promise<void> {
    const manager = tx || this.repository.manager;
    await manager.update(UserOrmEntity, userId, {
      hashedInviteToken: token,
      inviteTokenExpiresAt: expiresAt,
    });
  }

  async clearInviteToken(userId: string): Promise<void> {
    await this.repository.update(userId, {
      hashedInviteToken: null,
      inviteTokenExpiresAt: null,
    });
  }

  async findByInviteToken(token: string): Promise<UserTokenData | null> {
    const ormEntity = await this.repository
      .createQueryBuilder('user')
      .where('user.hashedInviteToken = :token', { token })
      .addSelect(['user.hashedInviteToken', 'user.inviteTokenExpiresAt'])
      .getOne();

    if (!ormEntity) return null;
    return {
      user: this.mapToDomain(ormEntity),
      tokenExpiresAt: ormEntity.inviteTokenExpiresAt ?? null,
    };
  }

  async findById(id: string): Promise<User | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    if (!ormEntity) return null;
    return this.mapToDomain(ormEntity);
  }

  async findAll(options?: FindUsersOptions): Promise<PaginatedResult<User>> {
    const page = options?.page && options.page > 0 ? options.page : 1;
    const limit = options?.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;
    const order = options?.order || 'DESC';

    const qb = this.repository.createQueryBuilder('user');

    if (options?.search) {
      const search = `%${options.search.trim()}%`;
      qb.andWhere(
        '(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search },
      );
    }

    if (options?.userType) {
      qb.andWhere('user.userType = :userType', { userType: options.userType });
    }

    if (options?.isBanned !== undefined) {
      qb.andWhere('user.isBanned = :isBanned', { isBanned: options.isBanned });
    }

    if (options?.isEmailVerified !== undefined) {
      qb.andWhere('user.isEmailVerified = :isEmailVerified', {
        isEmailVerified: options.isEmailVerified,
      });
    }

    qb.orderBy('user.createdAt', order);
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data: items.map((orm) => this.mapToDomain(orm)),
      total,
      page,
      limit,
      totalPages,
    };
  }
  // convert ORM entity -> Domain entity

  private mapToDomain(orm: UserOrmEntity): User {
    const user = new User();
    user.id = orm.id;
    user.email = orm.email;
    user.firstName = orm.firstName;
    user.lastName = orm.lastName;
    user.userType = orm.userType;
    user.phoneNumber = orm.phoneNumber ?? '';
    user.gender = orm.gender;
    user.dob = orm.dob;
    user.avatarURL = orm.avatarURL;
    user.avatarPublicId = orm.avatarPublicId;
    user.isBanned = orm.isBanned;
    user.isEmailVerified = orm.isEmailVerified;
    user.createdAt = orm.createdAt;
    user.updatedAt = orm.updatedAt;
    return user;
  }
}
