import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ISubscriptionRepository } from '../domain/subscription.repo.interface';
import { Subscription } from '../domain/subscription.entity';
import { SubscriptionOrmEntity } from './subscription.orm-entity';
import { SubscriptionStatus } from '../domain/subscription-status.enum';
import { PlanId } from '@/features/plans/domain/plan-id.enum';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';

@Injectable()
export class SubscriptionTypeormRepository implements ISubscriptionRepository {
  constructor(
    @InjectRepository(SubscriptionOrmEntity)
    private readonly repository: Repository<SubscriptionOrmEntity>,
  ) {}

  async findOneByCompanyIdAndStatus(
    companyId: string,
    status: SubscriptionStatus,
    tx?: EntityManager,
  ): Promise<Subscription | null> {
    const manager = tx || this.repository.manager;
    const ormEntity = await manager.findOne(SubscriptionOrmEntity, {
      where: { companyId, status },
    });
    return ormEntity ? this.mapToDomain(ormEntity) : null;
  }

  async findActiveOrPastDueByCompanyId(
    companyId: string,
    tx?: EntityManager,
  ): Promise<Subscription | null> {
    const manager = tx || this.repository.manager;
    const ormEntity = await manager
      .createQueryBuilder(SubscriptionOrmEntity, 'sub')
      .where('sub.companyId = :companyId', { companyId })
      .andWhere('sub.status IN (:...statuses)', {
        statuses: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE],
      })
      .getOne();
    return ormEntity ? this.mapToDomain(ormEntity) : null;
  }

  async findActiveAndPastDueProviderSubscriptions(
    tx?: EntityManager,
  ): Promise<Subscription[]> {
    const manager = tx || this.repository.manager;
    const ormEntities = await manager
      .createQueryBuilder(SubscriptionOrmEntity, 'sub')
      .where('sub.providerSubId IS NOT NULL')
      .andWhere('sub.status IN (:...statuses)', {
        statuses: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE],
      })
      .getMany();
    return ormEntities.map((e) => this.mapToDomain(e));
  }

  async findOneByProviderSubId(
    providerSubId: string,
    tx?: EntityManager,
  ): Promise<Subscription | null> {
    const manager = tx || this.repository.manager;
    const ormEntity = await manager.findOne(SubscriptionOrmEntity, {
      where: { providerSubId },
    });
    return ormEntity ? this.mapToDomain(ormEntity) : null;
  }

  async findSubscriptions(
    options: PageOptionsDto,
    status?: SubscriptionStatus,
    planId?: PlanId,
    search?: string,
  ): Promise<PaginatedResult<Subscription>> {
    const qb = this.repository
      .createQueryBuilder('sub')
      .leftJoin('sub.company', 'company')
      .addSelect(['company.name', 'company.logoUrl']);

    if (status) {
      qb.andWhere('sub.status = :status', { status });
    }

    if (planId) {
      qb.andWhere('sub.planId = :planId', { planId });
    }

    if (search) {
      qb.andWhere('company.name ILIKE :search', {
        search: `%${search.trim()}%`,
      });
    }

    qb.orderBy('sub.createdAt', options.order || 'DESC');
    qb.skip(options.skip).take(options.limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items.map((sub) => this.mapToDomain(sub)),
      total,
      page: options.page!,
      limit: options.limit!,
      totalPages: Math.ceil(total / options.limit!),
    };
  }

  async create(
    params: Partial<Subscription>,
    tx?: EntityManager,
  ): Promise<Subscription> {
    const manager = tx || this.repository.manager;
    const ormEntity = manager.create(SubscriptionOrmEntity, params);
    const saved = await manager.save(ormEntity);
    return this.mapToDomain(saved);
  }

  async save(
    subscription: Subscription,
    tx?: EntityManager,
  ): Promise<Subscription> {
    const manager = tx || this.repository.manager;
    const saved = await manager.save(SubscriptionOrmEntity, subscription);
    return this.mapToDomain(saved);
  }

  async findExpiredActiveSubscriptions(
    now: Date,
    tx?: EntityManager,
  ): Promise<Subscription[]> {
    const manager = tx || this.repository.manager;
    const ormEntities = await manager
      .createQueryBuilder(SubscriptionOrmEntity, 'sub')
      .where('sub.status = :status', { status: SubscriptionStatus.ACTIVE })
      .andWhere('sub.currentPeriodEnd IS NOT NULL')
      .andWhere('sub.currentPeriodEnd <= :now', { now })
      .andWhere('(sub.cancelAtPeriodEnd = true OR sub.providerSubId IS NULL)')
      .getMany();
    return ormEntities.map((e) => this.mapToDomain(e));
  }

  async findActivePlansByCompanyIds(
    companyIds: string[],
    tx?: EntityManager,
  ): Promise<Map<string, string>> {
    if (!companyIds.length) return new Map();
    const manager = tx || this.repository.manager;
    const raw = await manager
      .createQueryBuilder(SubscriptionOrmEntity, 'sub')
      .select('sub.companyId', 'companyId')
      .addSelect('sub.planId', 'planId')
      .where('sub.companyId IN (:...companyIds)', { companyIds })
      .andWhere('sub.status = :status', { status: SubscriptionStatus.ACTIVE })
      .getRawMany<{ companyId: string; planId: string }>();

    const map = new Map<string, string>();
    for (const row of raw) {
      map.set(row.companyId, row.planId);
    }
    return map;
  }

  private mapToDomain(ormEntity: SubscriptionOrmEntity): Subscription {
    const { company, ...columns } = ormEntity;
    const domain = new Subscription();
    Object.assign(domain, columns);
    if (company) {
      domain.companyName = company.name;
      domain.companyLogo = company.logoUrl ?? null;
    }
    return domain;
  }
}
