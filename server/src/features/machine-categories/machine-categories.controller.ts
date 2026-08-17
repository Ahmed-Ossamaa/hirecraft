import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MachineCategoriesService } from './machine-categories.service';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { MachineCategory } from './domain/machine-category.entity';

@ApiTags('Machine Categories')
@Controller('machine-categories')
export class MachineCategoriesController {
  constructor(private readonly machineCategoriesService: MachineCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get a paginated list of machine categories with optional search' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Search term' })
  @ApiResponse({ status: 200, description: 'Returns paginated categories', type: [MachineCategory] })
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query('q') searchQuery?: string,
  ) {
    return this.machineCategoriesService.findAll(pageOptionsDto, searchQuery);
  }
}
