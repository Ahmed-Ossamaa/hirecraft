import { ApiProperty } from '@nestjs/swagger';

export class MachineCategory {
  @ApiProperty({ description: 'The unique UUID of the category' })
  id!: string;

  @ApiProperty({ description: 'Category name in English' })
  nameEn!: string;

  @ApiProperty({ description: 'Category name in Arabic' })
  nameAr!: string;

  @ApiProperty({ description: 'Timestamp when the category was created' })
  createdAt!: Date;
}
