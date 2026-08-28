import { CompanyMember } from '@/features/company-members/domain/company-member.entity';

export class Company {
  id!: string;
  name!: string;
  logoUrl?: string | null;
  logoPublicId?: string | null;
  coverUrl?: string | null;
  coverPublicId?: string | null;
  description?: string;
  location?: string;
  size?: string;
  industry?: string;
  paymentCustomerId?: string | null;
  members?: CompanyMember[];
  createdAt!: Date;
  updatedAt!: Date;
}
