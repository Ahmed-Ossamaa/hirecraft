import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlansService } from './services/plans.service';
import { Plan } from './domain/plan.entity';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available subscription plans (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Returns all available subscription plans and their limits.',
    type: [Plan],
  })
  getPlans(): Plan[] {
    return this.plansService.getPlans();
  }
}
