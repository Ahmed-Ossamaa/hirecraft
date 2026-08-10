// src/features/company-members/domain/company-member.repository.interface.ts
import { CompanyMember } from './company-member.entity';
import { CompanyRole } from './company-role.enum';

export const COMPANY_MEMBER_REPOSITORY = Symbol('COMPANY_MEMBER_REPOSITORY');

// Explicitly define what is required to create a member
export type CreateCompanyMemberParams = {
  userId: string;
  companyId: string;
  role: CompanyRole;
};

export interface ICompanyMemberRepository {
  create(params: CreateCompanyMemberParams, tx?: any): Promise<CompanyMember>;
}
