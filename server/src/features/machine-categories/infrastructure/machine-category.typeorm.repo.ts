import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MachineCategoryRepositoryInterface } from '../domain/machine-category.repo.interface';
import { MachineCategory } from '../domain/machine-category.entity';
import { MachineCategoryOrmEntity } from './machine-category.orm-entity';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';

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

    qb.orderBy('category.nameEn', options.order)
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

  private mapToDomain(ormEntity: MachineCategoryOrmEntity): MachineCategory {
    const category = new MachineCategory();
    Object.assign(category, ormEntity);
    return category;
  }
}
