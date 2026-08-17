import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AcceptInviteDto {
  @ApiProperty()
  @IsString()
  token!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
