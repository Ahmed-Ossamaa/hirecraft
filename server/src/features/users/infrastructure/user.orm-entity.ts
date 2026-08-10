import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserType } from '../domain/user-type.enum';

@Entity('users')
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  passwordHash!: string;

  @Column({ type: 'varchar', select: false, nullable: true })
  hashedRefreshToken?: string | null;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ type: 'enum', enum: UserType })
  userType!: UserType;

  @Column({ type: 'date', nullable: true })
  dob?: Date;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  avatarURL?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
