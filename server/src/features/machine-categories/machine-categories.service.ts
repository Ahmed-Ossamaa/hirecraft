import { Injectable, Inject } from '@nestjs/common';
import {
  MACHINE_CATEGORY_REPOSITORY,
  type MachineCategoryRepositoryInterface,
} from './domain/machine-category.repo.interface';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';

@Injectable()
export class MachineCategoriesService {
  constructor(
    @Inject(MACHINE_CATEGORY_REPOSITORY)
    private readonly categoryRepository: MachineCategoryRepositoryInterface,
  ) {}

  async findAll(options: PageOptionsDto, searchQuery?: string) {
    return this.categoryRepository.findAll(options, searchQuery);
  }
}
