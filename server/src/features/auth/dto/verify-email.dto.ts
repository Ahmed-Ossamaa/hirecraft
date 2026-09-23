import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ example: 'random-token-string' })
  @IsString()
  @IsNotEmpty()
  token!: string;
}
