import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user.entity';

export class LoginResponseDto {
  @ApiProperty()
  user: User;

  @ApiProperty()
  accessToken: string;
}

export class RefreshResponseDto {
  @ApiProperty()
  accessToken: string;
}
