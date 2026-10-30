import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Company } from '../domain/company.entity';
import { CompanyMemberResponseDto } from '@/features/company-members/dto/company-member-response.dto';

export class CompanyResponseDto {
  @ApiProperty({ example: 'a4b82771-460d-45be-bb58-1fecb73fa911' })
  id!: string;

  @ApiProperty({ example: 'Precision Pro CNC' })
  name!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'https://res.cloudinary.com/.../logo.webp',
  })
  logoUrl?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'https://res.cloudinary.com/.../cover.webp',
  })
  coverUrl?: string | null;

  @ApiPropertyOptional({ example: 'Specialized CNC Machining' })
  description?: string;

  @ApiPropertyOptional({ nullable: true, example: 'EG' })
  country?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Cairo' })
  city?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '123 Industrial Zone' })
  address?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'contact@precisionpro.com',
  })
  email?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '+201000000000' })
  phone?: string | null;

  @ApiPropertyOptional({
    type: [String],
    nullable: true,
    example: ['Milling', 'Turning'],
  })
  specialties?: string[] | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'https://precisionpro.com',
  })
  website?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 2015 })
  foundedYear?: number | null;

  @ApiPropertyOptional({ example: '11-50' })
  size?: string;

  @ApiPropertyOptional({ example: 'Manufacturing' })
  industry?: string;

  @ApiPropertyOptional({ type: () => [CompanyMemberResponseDto] })
  members?: CompanyMemberResponseDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromDomain(company: Company): CompanyResponseDto {
    const dto = new CompanyResponseDto();
    dto.id = company.id;
    dto.name = company.name;
    dto.logoUrl = company.logoUrl;
    dto.coverUrl = company.coverUrl;
    dto.description = company.description;
    dto.country = company.country;
    dto.city = company.city;
    dto.address = company.address;
    dto.email = company.email;
    dto.phone = company.phone;
    dto.specialties = company.specialties;
    dto.website = company.website;
    dto.foundedYear = company.foundedYear;
    dto.size = company.size;
    dto.industry = company.industry;
    dto.createdAt = company.createdAt;
    dto.updatedAt = company.updatedAt;
    if (company.members) {
      dto.members = company.members.map((m) =>
        CompanyMemberResponseDto.fromDomain(m),
      );
    }
    return dto;
  }
}

