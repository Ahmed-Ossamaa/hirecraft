import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import {
  ICompanyMemberRepository,
  CreateCompanyMemberParams,
} from '../domain/company-member.repo.interface';
import { CompanyMember } from '../domain/company-member.entity';
import { CompanyMemberOrmEntity } from './company-member.orm-entity';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';

@Injectable()
export class CompanyMemberTypeormRepository implements ICompanyMemberRepository {
  constructor(
    @InjectRepository(CompanyMemberOrmEntity)
    private readonly repository: Repository<CompanyMemberOrmEntity>,
  ) {}

  async create(
    params: CreateCompanyMemberParams,
    tx?: EntityManager,
  ): Promise<CompanyMember> {
    const manager = tx || this.repository.manager;
    const member = manager.create(CompanyMemberOrmEntity, params);
    const savedMember = await manager.save(member);
    return this.mapToDomain(savedMember);
  }

  async findByUserIdAndCompanyId(
    userId: string,
    companyId: string,
  ): Promise<CompanyMember | null> {
    const member = await this.repository
      .createQueryBuilder('member')
      .where('member.userId = :userId', { userId })
      .andWhere('member.companyId = :companyId', { companyId })
      .leftJoin('member.user', 'user')
      .addSelect(['user.firstName', 'user.lastName', 'user.email'])
      .getOne();

    return member ? this.mapToDomain(member) : null;
  }

  async findByUserId(userId: string): Promise<CompanyMember | null> {
    const member = await this.repository
      .createQueryBuilder('member')
      .where('member.userId = :userId', { userId })
      .leftJoin('member.user', 'user')
      .addSelect(['user.firstName', 'user.lastName', 'user.email'])
      .getOne();

    return member ? this.mapToDomain(member) : null;
  }

  async findAllByCompanyId(
    companyId: string,
    options: PageOptionsDto,
  ): Promise<PaginatedResult<CompanyMember>> {
    const qb = this.repository
      .createQueryBuilder('member')
      .leftJoin('member.user', 'user')
      .where('member.companyId = :companyId', { companyId })
      .select([
        'member.id',
        'member.userId',
        'member.companyId',
        'member.role',
        'member.joinedAt',
        'member.isActive',
        'user.firstName',
        'user.lastName',
        'user.email',
      ])
      .orderBy('member.joinedAt', options.order)
      .skip(options.skip)
      .take(options.limit);

    const [members, total] = await qb.getManyAndCount();

    return {
      data: members.map((m) => this.mapToDomain(m)),
      total,
      page: options.page!,
      limit: options.limit!,
      totalPages: Math.ceil(total / options.limit!),
    };
  }

  async remove(userId: string, companyId: string): Promise<boolean> {
    const result = await this.repository.delete({ userId, companyId });
    return (result.affected ?? 0) > 0;
  }

  private mapToDomain(ormEntity: CompanyMemberOrmEntity): CompanyMember {
    const member = new CompanyMember();
    Object.assign(member, ormEntity);
    if (ormEntity.user) {
      member.firstName = ormEntity.user.firstName;
      member.lastName = ormEntity.user.lastName;
      member.email = ormEntity.user.email;
    }
    return member;
  }
}
