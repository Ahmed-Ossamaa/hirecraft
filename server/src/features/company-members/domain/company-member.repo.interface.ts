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

  findByUserId(userId: string): Promise<CompanyMember | null>;
  findByUserIdAndCompanyId(
    userId: string,
    companyId: string,
  ): Promise<CompanyMember | null>;
}
