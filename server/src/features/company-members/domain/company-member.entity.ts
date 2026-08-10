import { CompanyRole } from './company-role.enum';

export class CompanyMember {
  id!: string;
  userId!: string;
  companyId!: string;
  role!: CompanyRole;
  createdAt!: Date;
  updatedAt!: Date;
}
