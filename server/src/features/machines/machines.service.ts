import { Injectable, Inject } from '@nestjs/common';
import {
  MACHINE_REPOSITORY,
  type MachineRepositoryInterface,
} from './domain/machine.repo.interface';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';

@Injectable()
export class MachinesService {
  constructor(
    @Inject(MACHINE_REPOSITORY)
    private readonly machineRepository: MachineRepositoryInterface,
  ) {}

  async findAll(options: PageOptionsDto, categoryId?: string, searchQuery?: string) {
    return this.machineRepository.findAll(options, categoryId, searchQuery);
  }
}
