import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  MACHINE_CATEGORY_REPOSITORY,
  type MachineCategoryRepositoryInterface,
} from './domain/machine-category.repo.interface';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { CreateMachineCategoryDto } from './dto/create-machine-category.dto';
import { UpdateMachineCategoryDto } from './dto/update-machine-category.dto';
import { CategoryInUseError } from './domain/errors/category-in-use.error';

@Injectable()
export class MachineCategoriesService {
  constructor(
    @Inject(MACHINE_CATEGORY_REPOSITORY)
    private readonly categoryRepository: MachineCategoryRepositoryInterface,
  ) {}

  async findAll(options: PageOptionsDto, searchQuery?: string) {
    return this.categoryRepository.findAll(options, searchQuery);
  }

  async findById(id: string) {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Machine category with ID ${id} not found`);
    }
    return category;
  }

  create(dto: CreateMachineCategoryDto) {
    return this.categoryRepository.create(dto);
  }

  async update(id: string, dto: UpdateMachineCategoryDto): Promise<void> {
    const updated = await this.categoryRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Machine category with ID ${id} not found`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const deleted = await this.categoryRepository.delete(id);

      if (!deleted) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof CategoryInUseError) {
        throw new ConflictException(
          'Cannot delete this category because it is associated with existing machines or jobs.',
        );
      }

      throw error;
    }
  }
}
