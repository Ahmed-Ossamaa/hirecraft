import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyRole } from '../domain/company-role.enum';
import { CompanyMemberStatus } from '../domain/company-member-status.enum';
import { CompanyMember } from '../domain/company-member.entity';

export class CompanyMemberResponseDto {
  @ApiProperty({ example: 'b5c92882-571e-56cf-cc69-2gfdc84fb022' })
  id!: string;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  userId!: string;

  @ApiProperty({ example: 'a4b82771-460d-45be-bb58-1fecb73fa911' })
  companyId!: string;

  @ApiProperty({ enum: CompanyRole, example: CompanyRole.STAFF })
  role!: CompanyRole;

  @ApiProperty()
  joinedAt!: Date;

  @ApiProperty({
    enum: CompanyMemberStatus,
    example: CompanyMemberStatus.ACTIVE,
  })
  status!: CompanyMemberStatus;

  @ApiPropertyOptional({ nullable: true })
  deactivationReason?: string | null;

  @ApiPropertyOptional({ nullable: true })
  deactivatedAt?: Date | null;

  @ApiPropertyOptional({ example: 'John' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  lastName?: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  email?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromDomain(member: CompanyMember): CompanyMemberResponseDto {
    const dto = new CompanyMemberResponseDto();
    dto.id = member.id;
    dto.userId = member.userId;
    dto.companyId = member.companyId;
    dto.role = member.role;
    dto.joinedAt = member.joinedAt;
    dto.status = member.status;
    dto.deactivationReason = member.deactivationReason;
    dto.deactivatedAt = member.deactivatedAt;
    dto.firstName = member.firstName;
    dto.lastName = member.lastName;
    dto.email = member.email;
    dto.createdAt = member.createdAt;
    dto.updatedAt = member.updatedAt;
    return dto;
  }
}

