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

  // convert ORM entity -> Domain entity
  private mapToDomain(orm: UserOrmEntity): User {
    const user = new User();
    Object.assign(user, orm);
    return user;
  }
}
