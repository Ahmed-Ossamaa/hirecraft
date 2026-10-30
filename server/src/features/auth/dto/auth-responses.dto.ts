import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class LoginResponseDto {
  @ApiProperty({ type: () => UserResponseDto })
  user!: UserResponseDto;

  @ApiProperty()
  accessToken!: string;
}

export class RefreshResponseDto {
  @ApiProperty()
  accessToken!: string;
}
