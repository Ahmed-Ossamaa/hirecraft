import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType } from '../domain/user-type.enum';
import { Gender } from '../domain/gender.enum';
import { User } from '../domain/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'John' })
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  lastName!: string;

  @ApiProperty({ enum: UserType, example: UserType.CANDIDATE })
  userType!: UserType;

  @ApiProperty({ example: '+1234567890' })
  phoneNumber!: string;

  @ApiPropertyOptional({ enum: Gender, example: Gender.MALE })
  gender?: Gender;

  @ApiPropertyOptional({ example: '1990-01-01' })
  dob?: Date;

  @ApiPropertyOptional({ nullable: true })
  avatarURL?: string | null;

  @ApiProperty({ example: false })
  isBanned!: boolean;

  @ApiProperty({ example: true })
  isEmailVerified!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromDomain(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.userType = user.userType;
    dto.phoneNumber = user.phoneNumber;
    dto.gender = user.gender;
    dto.dob = user.dob;
    dto.avatarURL = user.avatarURL;
    dto.isBanned = user.isBanned;
    dto.isEmailVerified = user.isEmailVerified;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
