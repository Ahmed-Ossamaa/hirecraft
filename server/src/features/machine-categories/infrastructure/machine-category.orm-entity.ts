import { MachineOrmEntity } from '@/features/machines/infrastructure/machine.orm-entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('machine_categories')
export class MachineCategoryOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  nameEn!: string;

  @Column({ type: 'varchar', length: 100 })
  nameAr!: string;

  @Index('idx_machine_categories_CreatedAt')
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => MachineOrmEntity, (machine) => machine.category)
  machines!: MachineOrmEntity[];
}
