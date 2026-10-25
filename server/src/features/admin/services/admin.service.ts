import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '@/features/users/users.service';
import { CompaniesService } from '@/features/companies/companies.service';
import { JobsService } from '@/features/jobs/jobs.service';
import { SubscriptionsService } from '@/features/billing/services/subscriptions.service';
import { PlansService } from '@/features/plans/services/plans.service';
import { AdminUsersQueryDto } from '../dto/admin-users-query.dto';
import { AdminCompaniesQueryDto } from '../dto/admin-companies-query.dto';
import { AdminJobsQueryDto } from '../dto/admin-jobs-query.dto';
import { AdminBillingQueryDto } from '../dto/admin-billing-query.dto';
import { User } from '@/features/users/domain/user.entity';
import { Company } from '@/features/companies/domain/company.entity';
import { Job } from '@/features/jobs/domain/job.entity';
import { JobStatus } from '@/features/jobs/domain/job-status.enum';
import { PaginatedResult } from '@/common/pagination/paginated-results';
import { AdminSubscriptionResponseDto } from '../dto/admin-subscription-response.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly companiesService: CompaniesService,
    private readonly jobsService: JobsService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly plansService: PlansService,
  ) {}

  // User Management
  async getUsers(query: AdminUsersQueryDto): Promise<PaginatedResult<User>> {
    return this.usersService.findAllUsers({
      page: query.page,
      limit: query.limit,
      order: query.order,
      search: query.search,
      userType: query.userType,
      isBanned: query.isBanned,
      isEmailVerified: query.isEmailVerified,
    });
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  async updateUserBanStatus(userId: string, isBanned: boolean): Promise<void> {
    await this.usersService.banUser(userId, isBanned);
  }

  // Company Management
  async getCompanies(
    query: AdminCompaniesQueryDto,
  ): Promise<PaginatedResult<Company>> {
    return this.companiesService.findAllCompanies({
      page: query.page,
      limit: query.limit,
      order: query.order,
      search: query.search,
    });
  }

  async getCompanyById(companyId: string): Promise<Company> {
    return this.companiesService.getCompanyById(companyId);
  }

  // Job Management
  async getJobs(query: AdminJobsQueryDto): Promise<PaginatedResult<Job>> {
    return this.jobsService.findAllJobs(query, {
      search: query.search,
      status: query.status,
      companyId: query.companyId,
      jobType: query.jobType,
      experienceLevel: query.experienceLevel,
    });
  }

  async getJobById(jobId: string): Promise<Job> {
    return this.jobsService.getJobById(jobId);
  }

  async updateJobStatus(jobId: string, status: JobStatus): Promise<Job> {
    return this.jobsService.adminUpdateJobStatus(jobId, status);
  }

  async deleteJob(jobId: string): Promise<void> {
    return this.jobsService.adminDeleteJob(jobId);
  }

  // Billing Management
  async getSubscriptions(
    query: AdminBillingQueryDto,
  ): Promise<PaginatedResult<AdminSubscriptionResponseDto>> {
    return this.subscriptionsService.findSubscriptions(
      query,
      query.status,
      query.planId,
    );
  }
}
