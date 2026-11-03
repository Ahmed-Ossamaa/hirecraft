import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserResponseDto } from '@/features/users/dto/user-response.dto';
import { User } from '@/features/users/domain/user.entity';

export class AdminUserResponseDto extends UserResponseDto {
  @ApiPropertyOptional({ nullable: true, example: 'Tech Corp' })
  companyName?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'ADMIN' })
  companyRole?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  companyId?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  })
  workerProfileId?: string | null;

  static fromDomain(
    user: User,
    extra?: {
      companyName?: string | null;
      companyRole?: string | null;
      companyId?: string | null;
      workerProfileId?: string | null;
    },
  ): AdminUserResponseDto {
    const base = super.fromDomain(user);
    const dto = Object.assign(new AdminUserResponseDto(), base);
    dto.companyName = extra?.companyName ?? null;
    dto.companyRole = extra?.companyRole ?? null;
    dto.companyId = extra?.companyId ?? null;
    dto.workerProfileId = extra?.workerProfileId ?? null;
    return dto;
  }
}

