import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateMachineDto {
  @ApiProperty({
    example: 'Offset Press Heidelberg XL 106',
    description: 'Machine name in English',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameEn!: string;

  @ApiProperty({
    example: 'ماكينة طباعة أوفست هايدلبرغ',
    description: 'Machine name in Arabic',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameAr!: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID of the category this machine belongs to',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;
}
