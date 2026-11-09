import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MachinesService } from './machines.service';
import { Machine } from './domain/machine.entity';
import { ApiPaginatedResponse } from '@/common/swagger/api-paginated-response.decorator';
import { MachineQueryDto } from './dto/machine-query.dto';

@ApiTags('Machines')
@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Get()
  @ApiOperation({
    summary:
      'Get a paginated list of machines with optional search and category filter',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: String,
    description: 'Filter by category UUID',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    type: String,
    description: 'Search term',
  })
  @ApiPaginatedResponse(Machine)
  async getMachines(@Query() pageOptionsDto: MachineQueryDto) {
    return this.machinesService.findAll(
      pageOptionsDto,
      pageOptionsDto.categoryId,
      pageOptionsDto.q,
    );
  }
}
