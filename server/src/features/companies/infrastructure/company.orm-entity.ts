import { CompanyMemberOrmEntity } from '@/features/company-members/infrastructure/company-member.orm-entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('companies')
export class CompanyOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ nullable: true, type: 'varchar' })
  logoUrl?: string | null;

  @Column({ nullable: true, type: 'varchar' })
  logoPublicId?: string | null;

  @Column({ nullable: true, type: 'varchar' })
  coverUrl?: string | null;

  @Column({ nullable: true, type: 'varchar' })
  coverPublicId?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true, type: 'varchar' })
  country?: string | null;

  @Column({ nullable: true, type: 'varchar' })
  city?: string | null;

  @Column({ nullable: true, type: 'varchar' })
  address?: string | null;

  @Column({ nullable: true, type: 'varchar' })
  email?: string | null;

  @Column({ nullable: true, type: 'varchar' })
  phone?: string | null;

  @Column({ type: 'varchar', array: true, nullable: true })
  specialties?: string[] | null;

  @Column({ nullable: true, type: 'varchar' })
  website?: string | null;

  @Column({ nullable: true, type: 'int' })
  foundedYear?: number | null;

  @Column({ nullable: true })
  size?: string;

  @Column({ nullable: true })
  industry?: string;

  @Column({ nullable: true, type: 'varchar', unique: true })
  paymentCustomerId?: string | null;

  @OneToMany(() => CompanyMemberOrmEntity, (member) => member.company, {
    cascade: true,
  })
  members!: CompanyMemberOrmEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
