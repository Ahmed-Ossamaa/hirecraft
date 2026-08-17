import { ApiProperty } from '@nestjs/swagger';

export class Machine {
  @ApiProperty({ description: 'The unique UUID of the machine' })
  id!: string;

  @ApiProperty({ description: 'Machine name in English' })
  nameEn!: string;

  @ApiProperty({ description: 'Machine name in Arabic' })
  nameAr!: string;

  @ApiProperty({ description: 'The UUID of the category this machine belongs to' })
  categoryId!: string;
}
