import { MachineCategoryOrmEntity } from '@/features/machine-categories/infrastructure/machine-category.orm-entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => MachineCategoryOrmEntity, (category) => category.machines, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'categoryId',
    foreignKeyConstraintName: 'FK_machines_category',
  })
  category!: MachineCategoryOrmEntity;
}
