import { Module } from '@nestjs/common';
import { MachinesService } from './machines.service';
import { MachinesController } from './machines.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MachineOrmEntity } from './infrastructure/machine.orm-entity';

import { MACHINE_REPOSITORY } from './domain/machine.repo.interface';
import { MachineTypeormRepository } from './infrastructure/machine.typeorm.repo';

@Module({
  imports: [TypeOrmModule.forFeature([MachineOrmEntity])],
  controllers: [MachinesController],
  providers: [
    MachinesService,
    {
      provide: MACHINE_REPOSITORY,
      useClass: MachineTypeormRepository,
    },
  ],
})
export class MachinesModule {}
