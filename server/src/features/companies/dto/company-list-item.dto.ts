import { ApiProperty } from '@nestjs/swagger';

export class CompanyListItemDto {
  @ApiProperty({ example: 'a4b82771-460d-45be-bb58-1fecb73fa911' })
  id: string;

  @ApiProperty({ example: 'Precision Pro CNC' })
  name: string;

  @ApiProperty({
    nullable: true,
    example: 'https://res.cloudinary.com/.../logo.webp',
  })
  logoUrl?: string | null;

  @ApiProperty({
    nullable: true,
    example: 'https://res.cloudinary.com/.../cover.webp',
  })
  coverUrl?: string | null;

  @ApiProperty({
    nullable: true,
    example: 'CNC Machining & Tool & Die Manufacturing',
  })
  industry?: string | null;

  @ApiProperty({ nullable: true, example: 'EG' })
  country?: string | null;

  @ApiProperty({ nullable: true, example: 'Cairo' })
  city?: string | null;
}
