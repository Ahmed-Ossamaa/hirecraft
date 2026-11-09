import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  MACHINE_REPOSITORY,
  type MachineRepositoryInterface,
} from './domain/machine.repo.interface';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { Machine } from './domain/machine.entity';
import { isPostgresError } from '@/common/utils/postgres-error.util';

@Injectable()
export class MachinesService {
  constructor(
    @Inject(MACHINE_REPOSITORY)
    private readonly machineRepository: MachineRepositoryInterface,
  ) {}

  async findAll(
    options: PageOptionsDto,
    categoryId?: string,
    searchQuery?: string,
  ) {
    return this.machineRepository.findAll(options, categoryId, searchQuery);
  }

  async findById(id: string) {
    const machine = await this.machineRepository.findById(id);
    if (!machine) {
      throw new NotFoundException(`Machine with ID ${id} not found`);
    }
    return machine;
  }

  create(dto: CreateMachineDto): Promise<Machine> {
    return this.machineRepository.create(dto);
  }

  async update(id: string, dto: UpdateMachineDto): Promise<void> {
    const updated = await this.machineRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Machine with ID ${id} not found`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const deleted = await this.machineRepository.delete(id);
      if (!deleted) {
        throw new NotFoundException(`Machine with ID ${id} not found`);
      }
    } catch (error) {
      if (isPostgresError(error, '23503')) {
        throw new ConflictException(
          'Cannot delete this Machine because its used in some jobs',
        );
      }

      throw error;
    }
  }
}
