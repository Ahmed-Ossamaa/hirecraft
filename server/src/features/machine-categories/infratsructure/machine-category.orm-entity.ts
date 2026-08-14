import { MachineOrmEntity } from '@/features/machines/infrastructure/machine.orm-entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('machine_categories')
export class MachineCategoryOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  nameEn!: string;

  @Column({ type: 'varchar', length: 100 })
  nameAr!: string;

  @OneToMany(() => MachineOrmEntity, (machine) => machine.category)
  machines!: MachineOrmEntity[];
}
