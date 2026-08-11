import { User } from '@/features/users/domain/user.entity';
import { CompanyRole } from './company-role.enum';
import { Company } from '@/features/companies/domain/company.entity';

export class CompanyMember {
  id!: string;
  userId!: string;
  companyId!: string;
  role!: CompanyRole;
  joinedAt!: Date;
  isActive!: boolean;

  user?: User;
  company?: Company;

  createdAt!: Date;
  updatedAt!: Date;
}
