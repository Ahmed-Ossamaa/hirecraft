import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MachineCategoriesService } from './machine-categories.service';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { MachineCategory } from './domain/machine-category.entity';
import { ApiPaginatedResponse } from '@/common/swagger/api-paginated-response.decorator';

@ApiTags('Machine Categories')
@Controller('machine-categories')
export class MachineCategoriesController {
  constructor(
    private readonly machineCategoriesService: MachineCategoriesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get a paginated list of machine categories with optional search',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    type: String,
    description: 'Search term',
  })
  @ApiPaginatedResponse(MachineCategory)
  async getMachineCategories(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query('q') searchQuery?: string,
  ) {
    return this.machineCategoriesService.findAll(pageOptionsDto, searchQuery);
  }
}
