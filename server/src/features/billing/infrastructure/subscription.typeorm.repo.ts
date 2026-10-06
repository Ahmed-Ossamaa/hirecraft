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
  ): Promise<PaginatedResult<Subscription>> {
    const qb = this.repository.createQueryBuilder('sub');

    if (status) {
      qb.andWhere('sub.status = :status', { status });
    }

    if (planId) {
      qb.andWhere('sub.planId = :planId', { planId });
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

  private mapToDomain(ormEntity: SubscriptionOrmEntity): Subscription {
    const domain = new Subscription();
    Object.assign(domain, ormEntity);
    return domain;
  }
}
