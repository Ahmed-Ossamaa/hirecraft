import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CompanyRole } from '../domain/company-role.enum';

export class UpdateMemberRoleDto {
  @ApiProperty({
    enum: CompanyRole,
    description: 'New role for the company member',
  })
  @IsEnum(CompanyRole)
  role!: CompanyRole;
}
