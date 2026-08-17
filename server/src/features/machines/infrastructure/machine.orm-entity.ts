import { MachineCategoryOrmEntity } from '@/features/machine-categories/infrastructure/machine-category.orm-entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('machines')
export class MachineOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  nameEn!: string;

  @Column({ type: 'varchar', length: 100 })
  nameAr!: string;

  @Column({ type: 'uuid' })
  categoryId!: string;

  @ManyToOne(() => MachineCategoryOrmEntity, (category) => category.machines, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  category!: MachineCategoryOrmEntity;
}
