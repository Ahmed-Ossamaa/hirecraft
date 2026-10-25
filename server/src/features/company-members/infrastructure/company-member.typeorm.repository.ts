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
import { CompanyRole } from '../domain/company-role.enum';
import { CompanyMemberStatus } from '../domain/company-member-status.enum';

@Injectable()
export class CompanyMemberTypeormRepository implements ICompanyMemberRepository {
  constructor(
    @InjectRepository(CompanyMemberOrmEntity)
    private readonly repository: Repository<CompanyMemberOrmEntity>,
  ) {}

  /**
   * Creates a new company member record.
   */
  async create(
    params: CreateCompanyMemberParams,
    tx?: EntityManager,
  ): Promise<CompanyMember> {
    const manager = tx || this.repository.manager;
    const member = manager.create(CompanyMemberOrmEntity, params);
    const savedMember = await manager.save(member);
    return this.mapToDomain(savedMember);
  }

  /**
   * Finds a company member by user ID and company ID.
   */
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

  /**
   * Finds an active admin member for a company (used by  billing notifications for now ).
   */
  async findActiveAdminByCompanyId(
    companyId: string,
    tx?: EntityManager,
  ): Promise<CompanyMember | null> {
    const manager = tx || this.repository.manager;
    const member = await manager
      .createQueryBuilder(CompanyMemberOrmEntity, 'member')
      .where('member.companyId = :companyId', { companyId })
      .andWhere('member.role = :role', { role: CompanyRole.ADMIN })
      .andWhere('member.status = :status', {
        status: CompanyMemberStatus.ACTIVE,
      })
      .leftJoin('member.user', 'user')
      .addSelect(['user.firstName', 'user.lastName', 'user.email'])
      .getOne();

    return member ? this.mapToDomain(member) : null;
  }

  /**
   * Finds a company member by user ID.
   */
  async findByUserId(userId: string): Promise<CompanyMember | null> {
    const member = await this.repository
      .createQueryBuilder('member')
      .where('member.userId = :userId', { userId })
      .leftJoin('member.user', 'user')
      .addSelect(['user.firstName', 'user.lastName', 'user.email'])
      .getOne();

    return member ? this.mapToDomain(member) : null;
  }

  /**
   * Finds the active company member record for a user.
   */
  async findActiveByUserId(
    userId: string,
    tx?: EntityManager,
  ): Promise<CompanyMember | null> {
    const manager = tx || this.repository.manager;
    const member = await manager
      .createQueryBuilder(CompanyMemberOrmEntity, 'member')
      .where('member.userId = :userId', { userId })
      .andWhere('member.status = :status', {
        status: CompanyMemberStatus.ACTIVE,
      })
      .leftJoin('member.user', 'user')
      .addSelect(['user.firstName', 'user.lastName', 'user.email'])
      .getOne();

    return member ? this.mapToDomain(member) : null;
  }

  /**
   * Updates the role of a user's active company membership.
   */
  async updateRole(
    userId: string,
    role: CompanyRole,
    tx?: EntityManager,
  ): Promise<boolean> {
    const manager = tx || this.repository.manager;
    const result = await manager.update(
      CompanyMemberOrmEntity,
      { userId, status: CompanyMemberStatus.ACTIVE },
      { role },
    );
    return (result.affected ?? 0) > 0;
  }

  /**
   * Updates the status of a user's company membership.
   */
  async updateStatus(
    userId: string,
    status: CompanyMemberStatus,
    reason?: string | null,
    tx?: EntityManager,
  ): Promise<boolean> {
    const manager = tx || this.repository.manager;
    const updateData: Partial<CompanyMemberOrmEntity> = { status };
    if (status === CompanyMemberStatus.DEACTIVATED) {
      updateData.deactivationReason = reason ?? 'PLAN_LIMIT_EXCEEDED';
      updateData.deactivatedAt = new Date();
    } else if (status === CompanyMemberStatus.ACTIVE) {
      updateData.deactivationReason = null;
      updateData.deactivatedAt = null;
    }

    const result = await manager.update(
      CompanyMemberOrmEntity,
      { userId },
      updateData,
    );
    return (result.affected ?? 0) > 0;
  }

  async acceptInvite(userId: string, tx?: EntityManager): Promise<boolean> {
    const manager = tx || this.repository.manager;
    const result = await manager.update(
      CompanyMemberOrmEntity,
      { userId },
      {
        status: CompanyMemberStatus.ACTIVE,
        joinedAt: new Date(),
        deactivationReason: null,
        deactivatedAt: null,
      },
    );
    return (result.affected ?? 0) > 0;
  }

  /**
   * Counts the number of active admins in a company using pessimistic write lock to prevent race conditions.
   */
  async countActiveAdminsInCompany(
    companyId: string,
    tx?: EntityManager,
  ): Promise<number> {
    const manager = tx || this.repository.manager;
    const qb = manager
      .createQueryBuilder(CompanyMemberOrmEntity, 'member')
      .select('member.id')
      .where('member.companyId = :companyId', { companyId })
      .andWhere('member.role = :role', { role: CompanyRole.ADMIN })
      .andWhere('member.status = :status', {
        status: CompanyMemberStatus.ACTIVE,
      });

    if (tx) {
      qb.setLock('pessimistic_write');
    }

    const admins = await qb.getMany();
    return admins.length;
  }

  /**
   * Counts the number of active members in a company.
   */
  async countActiveMembersByCompanyId(
    companyId: string,
    tx?: EntityManager,
  ): Promise<number> {
    const manager = tx || this.repository.manager;
    return manager.count(CompanyMemberOrmEntity, {
      where: {
        companyId,
        status: CompanyMemberStatus.ACTIVE,
      },
    });
  }

  /**
   * Counts the number of reserved seats (ACTIVE + PENDING) in a company.
   */
  async countReservedMembersByCompanyId(
    companyId: string,
    tx?: EntityManager,
  ): Promise<number> {
    const manager = tx || this.repository.manager;
    const qb = manager.createQueryBuilder(CompanyMemberOrmEntity, 'member');
    return qb
      .where('member.companyId = :companyId', { companyId })
      .andWhere('member.status IN (:...statuses)', {
        statuses: [CompanyMemberStatus.ACTIVE, CompanyMemberStatus.PENDING],
      })
      .getCount();
  }

  /**
   * Retrieves paginated company members for a specific company.
   */
  async findAllByCompanyId(
    companyId: string,
    options: PageOptionsDto,
    status?: CompanyMemberStatus,
  ): Promise<PaginatedResult<CompanyMember>> {
    const qb = this.repository
      .createQueryBuilder('member')
      .leftJoin('member.user', 'user')
      .where('member.companyId = :companyId', { companyId });

    if (status) {
      qb.andWhere('member.status = :status', { status });
    }

    qb.select([
      'member.id',
      'member.userId',
      'member.companyId',
      'member.role',
      'member.joinedAt',
      'member.status',
      'member.deactivationReason',
      'member.deactivatedAt',
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

  /**
   * Removes a company member record by user ID and company ID.
   */
  async remove(userId: string, companyId: string): Promise<boolean> {
    const result = await this.repository.delete({ userId, companyId });
    return (result.affected ?? 0) > 0;
  }

  /**
   * Maps a TypeORM entity to a domain CompanyMember model.
   */
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
