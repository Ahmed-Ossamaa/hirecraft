import { Controller } from '@nestjs/common';
import { MachineCategoriesService } from './machine-categories.service';

@Controller('machine-categories')
export class MachineCategoriesController {
  constructor(private readonly machineCategoriesService: MachineCategoriesService) {}
}
