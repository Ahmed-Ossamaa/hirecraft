import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MachinesService } from './machines.service';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { Machine } from './domain/machine.entity';

@ApiTags('Machines')
@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Get()
  @ApiOperation({ summary: 'Get a paginated list of machines with optional search and category filter' })
  @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'Filter by category UUID' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Search term' })
  @ApiResponse({ status: 200, description: 'Returns paginated machines', type: [Machine] })
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query('categoryId') categoryId?: string,
    @Query('q') searchQuery?: string,
  ) {
    return this.machinesService.findAll(pageOptionsDto, categoryId, searchQuery);
  }
}
