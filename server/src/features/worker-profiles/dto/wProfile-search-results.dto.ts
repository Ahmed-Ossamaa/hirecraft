import { ApiProperty } from '@nestjs/swagger';

export class WorkerProfileSearchResultDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Sr. Technician' })
  title!: string;

  @ApiProperty()
  country!: string;

  @ApiProperty()
  city!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty({ nullable: true })
  avatarURL!: string | null;
}
