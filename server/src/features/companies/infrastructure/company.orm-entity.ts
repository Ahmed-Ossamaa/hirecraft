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

  @Column({ nullable: true })
  logoUrl?: string;

  @Column({ nullable: true })
  coverUrl?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  size?: string;

  @Column({ nullable: true })
  industry?: string;

  @OneToMany(() => CompanyMemberOrmEntity, (member) => member.company, {
    cascade: true,
  })
  members!: CompanyMemberOrmEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
