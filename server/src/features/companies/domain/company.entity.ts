import { CompanyMember } from '@/features/company-members/domain/company-member.entity';

export class Company {
  id!: string;
  name!: string;
  logoUrl?: string;
  coverUrl?: string;
  description?: string;
  location?: string;
  size?: string;
  industry?: string;
  members?: CompanyMember[];
  createdAt!: Date;
  updatedAt!: Date;
}
