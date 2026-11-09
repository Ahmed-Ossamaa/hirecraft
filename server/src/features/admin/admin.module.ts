import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from '@/features/users/infrastructure/user.orm-entity';
import { CompanyOrmEntity } from '@/features/companies/infrastructure/company.orm-entity';
import { JobOrmEntity } from '@/features/jobs/infrastructure/job.orm-entity';
import { SubscriptionOrmEntity } from '@/features/billing/infrastructure/subscription.orm-entity';
import { UsersModule } from '@/features/users/users.module';
import { CompaniesModule } from '@/features/companies/companies.module';
import { JobsModule } from '@/features/jobs/jobs.module';
import { BillingModule } from '@/features/billing/billing.module';
import { PlansModule } from '@/features/plans/plans.module';
import { CompanyMembersModule } from '@/features/company-members/company-members.module';
import { WorkerProfilesModule } from '@/features/worker-profiles/worker-profiles.module';
import { AnalyticsModule } from '@/features/analytics/analytics.module';
import { MachinesModule } from '@/features/machines/machines.module';
import { MachineCategoriesModule } from '@/features/machine-categories/machine-categories.module';
import { AdminService } from './services/admin.service';
import { AdminAnalyticsService } from './services/admin-analytics.service';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminCompaniesController } from './controllers/admin-companies.controller';
import { AdminJobsController } from './controllers/admin-jobs.controller';
import { AdminBillingController } from './controllers/admin-billing.controller';
import { AdminAnalyticsController } from './controllers/admin-analytics.controller';
import { AdminMachinesController } from './controllers/admin-machines.controller';
import { AdminMachineCategoriesController } from './controllers/admin-machine-categories.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserOrmEntity,
      CompanyOrmEntity,
      JobOrmEntity,
      SubscriptionOrmEntity,
    ]),
    UsersModule,
    CompaniesModule,
    JobsModule,
    BillingModule,
    PlansModule,
    CompanyMembersModule,
    WorkerProfilesModule,
    AnalyticsModule,
    MachinesModule,
    MachineCategoriesModule,
  ],
  controllers: [
    AdminUsersController,
    AdminCompaniesController,
    AdminJobsController,
    AdminBillingController,
    AdminAnalyticsController,
    AdminMachinesController,
    AdminMachineCategoriesController,
  ],
  providers: [AdminService, AdminAnalyticsService],
  exports: [AdminService, AdminAnalyticsService],
})
export class AdminModule {}
