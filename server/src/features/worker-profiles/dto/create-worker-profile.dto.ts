import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateWorkerProfileDto {
  @ApiProperty({ example: 'Printing Technician' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title!: string;

  @ApiPropertyOptional({ example: 'xyz company' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastCompany?: string;

  @ApiPropertyOptional({ example: 'I am an Offset printing technician' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  bio?: string;

  @ApiProperty({ example: 'Egypt' })
  @IsString()
  @IsNotEmpty()
  country!: string;

  @ApiProperty({ example: 'Alexandria' })
  @IsString()
  @IsNotEmpty()
  city!: string;
}
