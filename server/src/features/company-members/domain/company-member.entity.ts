import { User } from '@/features/users/domain/user.entity';
import { CompanyRole } from './company-role.enum';
import { CompanyMemberStatus } from './company-member-status.enum';
import { Company } from '@/features/companies/domain/company.entity';
import { ApiProperty, ApiPropertyOptional, ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class CompanyMember {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  companyId!: string;

  @ApiProperty({ enum: CompanyRole })
  role!: CompanyRole;

  @ApiProperty()
  joinedAt!: Date;

  @ApiProperty({ enum: CompanyMemberStatus })
  status!: CompanyMemberStatus;

  @ApiPropertyOptional()
  deactivationReason?: string | null;

  @ApiPropertyOptional()
  deactivatedAt?: Date | null;

  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiPropertyOptional()
  email?: string;

  @Exclude()
  @ApiHideProperty()
  user?: User;

  @Exclude()
  @ApiHideProperty()
  company?: Company;

  createdAt!: Date;
  updatedAt!: Date;
}
