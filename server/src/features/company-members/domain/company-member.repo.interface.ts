import { EntityManager } from 'typeorm';
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
  create(
    params: CreateCompanyMemberParams,
    tx?: EntityManager,
  ): Promise<CompanyMember>;

  findByUserId(userId: string): Promise<CompanyMember | null>;
  findActiveByUserId(
    userId: string,
    tx?: EntityManager,
  ): Promise<CompanyMember | null>;
  findByUserIdAndCompanyId(
    userId: string,
    companyId: string,
  ): Promise<CompanyMember | null>;

  findAllByCompanyId(
    companyId: string,
    options: PageOptionsDto,
  ): Promise<PaginatedResult<CompanyMember>>;

  updateRole(
    userId: string,
    role: CompanyRole,
    tx?: EntityManager,
  ): Promise<CompanyMember | null>;

  countActiveAdminsInCompany(
    companyId: string,
    tx?: EntityManager,
  ): Promise<number>;
  countActiveMembersByCompanyId(
    companyId: string,
    tx?: EntityManager,
  ): Promise<number>;

  remove(userId: string, companyId: string): Promise<boolean>;
}
