import { CompanyMember } from '@/features/company-members/domain/company-member.entity';
import { Exclude } from 'class-transformer';

export class Company {
  id!: string;
  name!: string;
  logoUrl?: string | null;

  @Exclude()
  logoPublicId?: string | null;

  coverUrl?: string | null;

  @Exclude()
  coverPublicId?: string | null;

  description?: string;
  location?: string;
  size?: string;
  industry?: string;

  @Exclude()
  paymentCustomerId?: string | null;

  members?: CompanyMember[];
  createdAt!: Date;
  updatedAt!: Date;
}
