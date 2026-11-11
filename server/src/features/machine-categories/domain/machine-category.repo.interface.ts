import { MachineCategory } from './machine-category.entity';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';

export const MACHINE_CATEGORY_REPOSITORY = Symbol(
  'MACHINE_CATEGORY_REPOSITORY',
);

export interface createMachineCategory {
  nameEn: string;
  nameAr: string;
}

export interface MachineCategoryRepositoryInterface {
  findAll(
    options: PageOptionsDto,
    searchQuery?: string,
  ): Promise<PaginatedResult<MachineCategory>>;

  findById(id: string): Promise<MachineCategory | null>;

  create(data: createMachineCategory): Promise<MachineCategory>;

  update(id: string, data: Partial<createMachineCategory>): Promise<boolean>;

  delete(id: string): Promise<boolean>;
}
