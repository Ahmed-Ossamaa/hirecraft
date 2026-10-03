import { User } from '@/features/users/domain/user.entity';
import { CompanyRole } from './company-role.enum';
import { CompanyMemberStatus } from './company-member-status.enum';
import { Company } from '@/features/companies/domain/company.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiPropertyOptional()
  email?: string;

  user?: User;
  company?: Company;

  createdAt!: Date;
  updatedAt!: Date;
}
