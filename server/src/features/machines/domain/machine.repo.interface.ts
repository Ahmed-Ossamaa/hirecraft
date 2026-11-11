import { Machine } from './machine.entity';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';
import { CreateMachineDto } from '../dto/create-machine.dto';
import { UpdateMachineDto } from '../dto/update-machine.dto';

export const MACHINE_REPOSITORY = Symbol('MACHINE_REPOSITORY');

export interface CreateMachineData {
  nameEn: string;
  nameAr: string;
  categoryId: string;
}

export interface MachineRepositoryInterface {
  findAll(
    options: PageOptionsDto,
    categoryId?: string,
    searchQuery?: string,
  ): Promise<PaginatedResult<Machine>>;

  findById(id: string): Promise<Machine | null>;

  create(data: CreateMachineDto): Promise<Machine>;

  update(id: string, data: UpdateMachineDto): Promise<boolean>;

  delete(id: string): Promise<boolean>;
}
