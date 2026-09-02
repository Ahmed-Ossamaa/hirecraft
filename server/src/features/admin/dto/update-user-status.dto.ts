import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserStatusDto {
  @ApiProperty({ description: 'Whether the user should be banned or unbanned' })
  @IsBoolean()
  isBanned!: boolean;
}
