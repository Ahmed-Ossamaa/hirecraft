import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString } from 'class-validator';
import { CompanyRole } from '../domain/company-role.enum';

export class InviteMemberDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  firstName!: string;

  @ApiProperty()
  @IsString()
  lastName!: string;

  @ApiProperty({ enum: CompanyRole })
  @IsEnum(CompanyRole)
  role!: CompanyRole;
}
