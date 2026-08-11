import { CompanyMember } from './company-member.entity';
import { CompanyRole } from './company-role.enum';

export const COMPANY_MEMBER_REPOSITORY = Symbol('COMPANY_MEMBER_REPOSITORY');

export type CreateCompanyMemberParams = {
  userId: string;
  companyId: string;
  role: CompanyRole;
};

export interface ICompanyMemberRepository {
  create(params: CreateCompanyMemberParams, tx?: any): Promise<CompanyMember>;
  findByUserIdAndCompanyId(
    userId: string,
    companyId: string,
  ): Promise<CompanyMember | null>;
}
