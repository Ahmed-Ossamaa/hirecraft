import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateMachineData,
  MachineRepositoryInterface,
} from '../domain/machine.repo.interface';
import { Machine } from '../domain/machine.entity';
import { MachineOrmEntity } from './machine.orm-entity';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';
import { getPostgresErrorDetails } from '@/common/utils/database/postgres-error.util';
import { MachineInUseError } from '../domain/errors/machine-in-use.error';

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

    qb.orderBy('machine.createdAt', options.order)
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

  async create(data: CreateMachineData): Promise<Machine> {
    const machine = this.repository.create(data);
    const saved = await this.repository.save(machine);
    return this.mapToDomain(saved);
  }

  async update(id: string, data: Partial<CreateMachineData>): Promise<boolean> {
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
        details.constraint === 'FK_jobs_machine'
      ) {
        throw new MachineInUseError();
      }
      throw error;
    }
  }

  private mapToDomain(ormEntity: MachineOrmEntity): Machine {
    const machine = new Machine();
    Object.assign(machine, ormEntity);
    return machine;
  }
}
