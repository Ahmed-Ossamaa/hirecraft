import { CompanyMember } from './company-member.entity';
import { CompanyRole } from './company-role.enum';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';

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

  findAllByCompanyId(
    companyId: string,
    options: PageOptionsDto,
  ): Promise<PaginatedResult<CompanyMember>>;

  remove(userId: string, companyId: string): Promise<boolean>;
}
