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

  @Column({ nullable: true })
  location?: string;

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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
