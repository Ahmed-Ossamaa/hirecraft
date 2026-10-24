import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiStandardArrayResponse } from '@/common/swagger/api-standard-array-response.decorator';
import { PlansService } from './services/plans.service';
import { Plan } from './domain/plan.entity';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available subscription plans (Public)' })
  @ApiStandardArrayResponse(Plan)
  @ApiResponse({
    status: 200,
    description: 'Returns all available subscription plans and their limits.',
  })
  async getPlans(): Promise<Plan[]> {
    return this.plansService.getPlansWithPrices();
  }
}
