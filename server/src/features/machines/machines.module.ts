import { Module } from '@nestjs/common';
import { MachinesService } from './machines.service';
import { MachinesController } from './machines.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MachineOrmEntity } from './infrastructure/machine.orm-entity';

@Module({
  imports: [TypeOrmModule.forFeature([MachineOrmEntity])],
  controllers: [MachinesController],
  providers: [MachinesService],
})
export class MachinesModule {}
