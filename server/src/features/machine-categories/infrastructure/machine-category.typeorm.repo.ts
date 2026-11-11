import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  createMachineCategory,
  MachineCategoryRepositoryInterface,
} from '../domain/machine-category.repo.interface';
import { MachineCategory } from '../domain/machine-category.entity';
import { MachineCategoryOrmEntity } from './machine-category.orm-entity';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';
import { CategoryInUseError } from '../domain/errors/category-in-use.error';
import { getPostgresErrorDetails } from '@/common/utils/database/postgres-error.util';

@Injectable()
export class MachineCategoryTypeormRepository implements MachineCategoryRepositoryInterface {
  constructor(
    @InjectRepository(MachineCategoryOrmEntity)
    private readonly repository: Repository<MachineCategoryOrmEntity>,
  ) {}

  async findAll(
    options: PageOptionsDto,
    searchQuery?: string,
  ): Promise<PaginatedResult<MachineCategory>> {
    const qb = this.repository.createQueryBuilder('category');

    if (searchQuery) {
      qb.where(
        'category.nameEn ILIKE :search OR category.nameAr ILIKE :search',
        { search: `%${searchQuery}%` },
      );
    }

    qb.orderBy('category.createdAt', options.order)
      .skip(options.skip)
      .take(options.limit);

    const [categories, total] = await qb.getManyAndCount();

    return {
      data: categories.map((cat) => this.mapToDomain(cat)),
      total,
      page: options.page!,
      limit: options.limit!,
      totalPages: Math.ceil(total / options.limit!),
    };
  }

  async findById(id: string): Promise<MachineCategory | null> {
    const category = await this.repository.findOne({ where: { id } });
    return category ? this.mapToDomain(category) : null;
  }

  async create(data: createMachineCategory): Promise<MachineCategory> {
    const category = this.repository.create(data);
    const saved = await this.repository.save(category);
    return this.mapToDomain(saved);
  }

  async update(
    id: string,
    data: Partial<createMachineCategory>,
  ): Promise<boolean> {
    const result = await this.repository.update(id, data);

    return (result.affected ?? 0) > 0;
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.repository.delete(id);
      return (result.affected ?? 0) > 0;
    } catch (error) {
      const details = getPostgresErrorDetails(error);

      if (
        details?.code === '23503' &&
        ['FK_machines_category', 'FK_jobs_category'].includes(
          details.constraint ?? '',
        )
      ) {
        throw new CategoryInUseError();
      }

      throw error;
    }
  }

  private mapToDomain(ormEntity: MachineCategoryOrmEntity): MachineCategory {
    const category = new MachineCategory();
    Object.assign(category, ormEntity);
    return category;
  }
}
