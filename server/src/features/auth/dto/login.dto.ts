import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'ahmed@gmail.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPass_123' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
