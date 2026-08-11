import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { UserType } from '../../users/domain/user-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateCompanyDto } from '@/features/companies/dto/create-company.dto';

export class SignupDto {
  @ApiProperty({ example: 'Ahmed@gmail.com' })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({ example: 'myPass_123', minLength: 8, maxLength: 72 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @ApiProperty({ example: 'Ahmed', minLength: 2, maxLength: 30 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(30)
  firstName!: string;

  @ApiProperty({ example: 'Ossama', minLength: 2, maxLength: 30 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(30)
  lastName!: string;

  @ApiProperty({ example: '01012345678', minLength: 11 })
  @IsString()
  @IsNotEmpty()
  @MinLength(11, { message: 'Invalid phone number' })
  @MaxLength(15, { message: 'Invalid phone number' })
  phoneNumber!: string;

  @ApiProperty({ enum: UserType, example: UserType.EMPLOYER })
  @IsEnum(UserType)
  userType!: UserType;

  @ValidateNested()
  @Type(() => CreateCompanyDto)
  @IsOptional()
  companyData?: CreateCompanyDto;
}
