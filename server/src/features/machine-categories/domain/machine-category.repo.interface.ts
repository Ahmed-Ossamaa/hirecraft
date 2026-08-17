import { MachineCategory } from './machine-category.entity';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';

export const MACHINE_CATEGORY_REPOSITORY = Symbol(
  'MACHINE_CATEGORY_REPOSITORY',
);

export interface MachineCategoryRepositoryInterface {
  findAll(
    options: PageOptionsDto,
    searchQuery?: string,
  ): Promise<PaginatedResult<MachineCategory>>;
  
  findById(id: string): Promise<MachineCategory | null>;
}
