import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMachineCategoryDto {
  @ApiProperty({
    example: 'Printing Press',
    description: 'Category name in English',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameEn!: string;

  @ApiProperty({
    example: 'مطابع',
    description: 'Category name in Arabic',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameAr!: string;
}
