import { Injectable, Inject } from '@nestjs/common';
import {
  type ICompanyMemberRepository,
  COMPANY_MEMBER_REPOSITORY,
  CreateCompanyMemberParams,
} from './domain/company-member.repo.interface';
import { CompanyMember } from './domain/company-member.entity';

@Injectable()
export class CompanyMembersService {
  constructor(
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly companyMemberRepository: ICompanyMemberRepository,
  ) {}

  async addMember(
    params: CreateCompanyMemberParams,
    tx?: any,
  ): Promise<CompanyMember> {
    return this.companyMemberRepository.create(params, tx);
  }

  async getMembershipByUserId(userId: string): Promise<CompanyMember | null> {
    return this.companyMemberRepository.findByUserId(userId);
  }
  async checkMembership(
    userId: string,
    companyId: string,
  ): Promise<CompanyMember | null> {
    return this.companyMemberRepository.findByUserIdAndCompanyId(
      userId,
      companyId,
    );
  }
}
