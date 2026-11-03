import { ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyResponseDto } from '@/features/companies/dto/company-response.dto';
import { Company } from '@/features/companies/domain/company.entity';

export class AdminCompanyResponseDto extends CompanyResponseDto {
  @ApiPropertyOptional({ example: 5 })
  memberCount?: number;

  @ApiPropertyOptional({ example: 3 })
  jobCount?: number;

  @ApiPropertyOptional({ example: 'PRO', nullable: true })
  subscriptionPlan?: string | null;

  static fromDomain(
    company: Company,
    extra?: {
      memberCount?: number;
      jobCount?: number;
      subscriptionPlan?: string | null;
    },
  ): AdminCompanyResponseDto {
    const base = super.fromDomain(company);
    const dto = Object.assign(new AdminCompanyResponseDto(), base);
    if (extra?.memberCount !== undefined) {
      dto.memberCount = extra.memberCount;
    }
    if (extra?.jobCount !== undefined) {
      dto.jobCount = extra.jobCount;
    }
    dto.subscriptionPlan = extra?.subscriptionPlan ?? null;
    return dto;
  }
}
