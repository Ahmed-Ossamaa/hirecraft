import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '@/features/users/users.service';
import { CompaniesService } from '@/features/companies/companies.service';
import { CompanyMembersService } from '@/features/company-members/company-members.service';
import { JobsService } from '@/features/jobs/jobs.service';
import { SubscriptionsService } from '@/features/billing/services/subscriptions.service';
import { AdminUsersQueryDto } from '../dto/admin-users-query.dto';
import { AdminCompaniesQueryDto } from '../dto/admin-companies-query.dto';
import { AdminJobsQueryDto } from '../dto/admin-jobs-query.dto';
import { AdminBillingQueryDto } from '../dto/admin-billing-query.dto';
import { User } from '@/features/users/domain/user.entity';
import { UserType } from '@/features/users/domain/user-type.enum';
import { Company } from '@/features/companies/domain/company.entity';
import { Job } from '@/features/jobs/domain/job.entity';
import { JobStatus } from '@/features/jobs/domain/job-status.enum';
import { PaginatedResult } from '@/common/pagination/paginated-results';
import { Subscription } from '@/features/billing/domain/subscription.entity';
import { CompanyMember } from '@/features/company-members/domain/company-member.entity';
import { CompanyMemberBasicInfo } from '@/features/company-members/domain/company-member.repo.interface';
import { GetCompanyMembersDto } from '@/features/company-members/dto/get-company-members.dto';
import { WorkerProfilesService } from '@/features/worker-profiles/worker-profiles.service';
import { MachinesService } from '@/features/machines/machines.service';
import { MachineCategoriesService } from '@/features/machine-categories/machine-categories.service';
import { CreateMachineDto } from '@/features/machines/dto/create-machine.dto';
import { UpdateMachineDto } from '@/features/machines/dto/update-machine.dto';
import { CreateMachineCategoryDto } from '@/features/machine-categories/dto/create-machine-category.dto';
import { UpdateMachineCategoryDto } from '@/features/machine-categories/dto/update-machine-category.dto';
import { Machine } from '@/features/machines/domain/machine.entity';
import { MachineCategory } from '@/features/machine-categories/domain/machine-category.entity';

export type AdminUserData = User & {
  companyName?: string | null;
  companyRole?: string | null;
  companyId?: string | null;
  workerProfileId?: string | null;
};

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly companiesService: CompaniesService,
    private readonly companyMembersService: CompanyMembersService,
    private readonly workerProfilesService: WorkerProfilesService,
    private readonly jobsService: JobsService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly machinesService: MachinesService,
    private readonly machineCategoriesService: MachineCategoriesService,
    // private readonly plansService: PlansService,
  ) {}

  // ----- User Management -----

  /**
   * Retrieves paginated users enriched with company details (employers) or profile IDs (candidates).
   */
  async getUsers(
    query: AdminUsersQueryDto,
  ): Promise<PaginatedResult<AdminUserData>> {
    const paginated = await this.usersService.findAllUsers({
      page: query.page,
      limit: query.limit,
      order: query.order,
      search: query.search,
      userType: query.userType,
      isBanned: query.isBanned,
      isEmailVerified: query.isEmailVerified,
    });

    const employerIds = paginated.data
      .filter((u) => u.userType === UserType.EMPLOYER)
      .map((u) => u.id);

    const candidateIds = paginated.data
      .filter((u) => u.userType === UserType.CANDIDATE)
      .map((u) => u.id);

    const [companyDetailsMap, workerProfileMap] = await Promise.all([
      employerIds.length > 0
        ? this.companyMembersService.findCompanyDetailsByUserIds(employerIds)
        : Promise.resolve(new Map<string, CompanyMemberBasicInfo>()),
      candidateIds.length > 0
        ? this.workerProfilesService.findProfileIdsByUserIds(candidateIds)
        : Promise.resolve(new Map<string, string>()),
    ]);

    const data: AdminUserData[] = paginated.data.map((u) => {
      const companyInfo = companyDetailsMap.get(u.id);
      const workerProfileId = workerProfileMap.get(u.id) ?? null;

      return Object.assign(u, {
        companyName: companyInfo?.companyName ?? null,
        companyRole: companyInfo?.role ?? null,
        companyId: companyInfo?.companyId ?? null,
        workerProfileId,
      });
    });

    return {
      ...paginated,
      data,
    };
  }

  /**
   * Retrieves a single user by ID with associated employer or candidate metadata.
   */
  async getUserById(userId: string): Promise<AdminUserData> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    let companyName: string | null = null;
    let companyRole: string | null = null;
    let companyId: string | null = null;
    let workerProfileId: string | null = null;

    if (user.userType === UserType.EMPLOYER) {
      const companyMap =
        await this.companyMembersService.findCompanyDetailsByUserIds([user.id]);
      const info = companyMap.get(user.id);
      companyName = info?.companyName ?? null;
      companyRole = info?.role ?? null;
      companyId = info?.companyId ?? null;
    } else if (user.userType === UserType.CANDIDATE) {
      const profileMap =
        await this.workerProfilesService.findProfileIdsByUserIds([user.id]);
      workerProfileId = profileMap.get(user.id) ?? null;
    }

    return Object.assign(user, {
      companyName,
      companyRole,
      companyId,
      workerProfileId,
    });
  }

  /**
   * Ban or Unban a user.
   */
  /**
   * Updates the ban status of a user.
   */
  async updateUserBanStatus(userId: string, isBanned: boolean): Promise<void> {
    await this.usersService.banUser(userId, isBanned);
  }

  // ----- Company Management -----

  /**
   * Retrieves paginated companies enriched with active member and published job counts.
   */
  async getCompanies(query: AdminCompaniesQueryDto): Promise<
    PaginatedResult<
      Company & {
        memberCount?: number;
        jobCount?: number;
        subscriptionPlan?: string | null;
      }
    >
  > {
    const paginated = await this.companiesService.findAllCompanies({
      page: query.page,
      limit: query.limit,
      order: query.order,
      search: query.search,
      industry: query.industry,
      country: query.country,
      city: query.city,
    });

    const companyIds = paginated.data.map((c) => c.id);
    if (companyIds.length === 0) {
      return paginated;
    }

    const [memberMap, jobMap, planMap] = await Promise.all([
      this.companyMembersService.countActiveMembersByCompanyIds(companyIds),
      this.jobsService.countJobsByCompanyIds(companyIds, JobStatus.PUBLISHED),
      this.subscriptionsService.getActivePlansByCompanyIds(companyIds),
    ]);

    const data = paginated.data.map((c) =>
      Object.assign(c, {
        memberCount: memberMap.get(c.id) ?? 0,
        jobCount: jobMap.get(c.id) ?? 0,
        subscriptionPlan: planMap.get(c.id) ?? null,
      }),
    );

    return {
      ...paginated,
      data,
    };
  }

  /**
   * Retrieves a company by ID with its active member and job counts.
   */
  async getCompanyById(companyId: string): Promise<{
    company: Company & { subscriptionPlan?: string | null };
    memberCount: number;
    jobCount: number;
  }> {
    const company = await this.companiesService.getCompanyById(companyId);
    const [memberCount, jobMap, planMap] = await Promise.all([
      this.companyMembersService.countActiveMembersByCompanyId(companyId),
      this.jobsService.countJobsByCompanyIds([companyId]),
      this.subscriptionsService.getActivePlansByCompanyIds([companyId]),
    ]);
    return {
      company: Object.assign(company, {
        subscriptionPlan: planMap.get(companyId) ?? null,
      }),
      memberCount,
      jobCount: jobMap.get(companyId) ?? 0,
    };
  }

  /**
   * Retrieves paginated members of a specific company.
   */
  async getCompanyMembers(
    companyId: string,
    query: GetCompanyMembersDto,
  ): Promise<PaginatedResult<CompanyMember>> {
    return this.companyMembersService.getMembers(
      companyId,
      query,
      query.status,
    );
  }

  // ----- Job Management -----

  /**
   * Retrieves paginated jobs based on administrative search and filter criteria.
   */
  async getJobs(query: AdminJobsQueryDto): Promise<PaginatedResult<Job>> {
    return this.jobsService.findAllJobs(query, {
      search: query.search,
      status: query.status,
      companyId: query.companyId,
      jobType: query.jobType,
      experienceLevel: query.experienceLevel,
    });
  }

  /**
   * Retrieves a single job by ID.
   */
  async getJobById(jobId: string): Promise<Job> {
    return this.jobsService.getJobById(jobId);
  }

  /**
   * Updates the status of a job (e.g., PUBLISHED, DRAFT, CLOSED).
   */
  async updateJobStatus(jobId: string, status: JobStatus): Promise<Job> {
    return this.jobsService.adminUpdateJobStatus(jobId, status);
  }

  /**
   * Permanently deletes a job listing.
   */
  async deleteJob(jobId: string): Promise<void> {
    return this.jobsService.adminDeleteJob(jobId);
  }

  // ----- Billing Management -----

  /**
   * Retrieves paginated billing subscriptions with joined company details and filters.
   */
  async getSubscriptions(
    query: AdminBillingQueryDto,
  ): Promise<PaginatedResult<Subscription>> {
    return this.subscriptionsService.findSubscriptions(
      query,
      query.status,
      query.planId,
      query.search,
    );
  }

  // ----- Machine Catalog Management -----

  async createMachine(dto: CreateMachineDto): Promise<Machine> {
    return this.machinesService.create(dto);
  }

  async updateMachine(id: string, dto: UpdateMachineDto): Promise<void> {
    return this.machinesService.update(id, dto);
  }

  async deleteMachine(id: string): Promise<void> {
    return this.machinesService.delete(id);
  }

  async createMachineCategory(
    dto: CreateMachineCategoryDto,
  ): Promise<MachineCategory> {
    return this.machineCategoriesService.create(dto);
  }

  async updateMachineCategory(
    id: string,
    dto: UpdateMachineCategoryDto,
  ): Promise<void> {
    return this.machineCategoriesService.update(id, dto);
  }

  async deleteMachineCategory(id: string): Promise<void> {
    return this.machineCategoriesService.delete(id);
  }
}
