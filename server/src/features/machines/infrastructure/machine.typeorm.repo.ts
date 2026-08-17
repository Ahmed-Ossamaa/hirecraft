import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MachineRepositoryInterface } from '../domain/machine.repo.interface';
import { Machine } from '../domain/machine.entity';
import { MachineOrmEntity } from './machine.orm-entity';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';

@Injectable()
export class MachineTypeormRepository implements MachineRepositoryInterface {
  constructor(
    @InjectRepository(MachineOrmEntity)
    private readonly repository: Repository<MachineOrmEntity>,
  ) {}

  async findAll(
    options: PageOptionsDto,
    categoryId?: string,
    searchQuery?: string,
  ): Promise<PaginatedResult<Machine>> {
    const qb = this.repository.createQueryBuilder('machine');

    if (categoryId) {
      qb.andWhere('machine.categoryId = :categoryId', { categoryId });
    }

    if (searchQuery) {
      qb.andWhere(
        '(machine.nameEn ILIKE :search OR machine.nameAr ILIKE :search)',
        { search: `%${searchQuery}%` },
      );
    }

    qb.orderBy('machine.nameEn', options.order)
      .skip(options.skip)
      .take(options.limit);

    const [machines, total] = await qb.getManyAndCount();

    return {
      data: machines.map((machine) => this.mapToDomain(machine)),
      total,
      page: options.page!,
      limit: options.limit!,
      totalPages: Math.ceil(total / options.limit!),
    };
  }

  async findById(id: string): Promise<Machine | null> {
    const machine = await this.repository.findOne({ where: { id } });
    return machine ? this.mapToDomain(machine) : null;
  }

  private mapToDomain(ormEntity: MachineOrmEntity): Machine {
    const machine = new Machine();
    Object.assign(machine, ormEntity);
    return machine;
  }
}
