import { Machine } from './machine.entity';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';

export const MACHINE_REPOSITORY = Symbol('MACHINE_REPOSITORY');

export interface MachineRepositoryInterface {
  findAll(
    options: PageOptionsDto,
    categoryId?: string,
    searchQuery?: string,
  ): Promise<PaginatedResult<Machine>>;

  findById(id: string): Promise<Machine | null>;
}
