import { CompanyMember } from '@/features/company-members/domain/company-member.entity';
import { Exclude } from 'class-transformer';
import { ApiHideProperty } from '@nestjs/swagger';

export class Company {
  id!: string;
  name!: string;
  logoUrl?: string | null;

  @Exclude()
  @ApiHideProperty()
  logoPublicId?: string | null;

  coverUrl?: string | null;

  @Exclude()
  @ApiHideProperty()
  coverPublicId?: string | null;

  description?: string;
  country?: string;
  city?: string;
  address?: string;
  email?: string | null;
  phone?: string | null;
  specialties?: string[] | null;
  website?: string | null;
  foundedYear?: number | null;
  size?: string;
  industry?: string;

  @Exclude()
  @ApiHideProperty()
  paymentCustomerId?: string | null;

  members?: CompanyMember[];
  createdAt!: Date;
  updatedAt!: Date;
}
