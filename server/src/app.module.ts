import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './features/users/users.module';
import { AuthModule } from './features/auth/auth.module';
import { CompaniesModule } from './features/companies/companies.module';
import { JobsModule } from './features/jobs/jobs.module';
import { ApplicationsModule } from './features/applications/applications.module';
import { CompanyMembersModule } from './features/company-members/company-members.module';
import { ConfigModule } from '@nestjs/config';
import dbConfig from './config/db.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validateEnv } from './config/validate-env';
import { MachineCategoriesModule } from './features/machine-categories/machine-categories.module';
import { MachinesModule } from './features/machines/machines.module';
import { WorkerProfilesModule } from './features/worker-profiles/worker-profiles.module';
import appConfig from './config/app.config';
import jwtConfig from './config/jwt.config';
import mailConfig from './config/mail.config';
import stripeConfig from './config/stripe.config';
import plansConfig from './config/plans.config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { BillingModule } from './features/billing/billing.module';
import { PlansModule } from './features/plans/plans.module';
import { SubscriptionLimitsModule } from './features/billing/subscription-limits/subscription-limits.module';
import { AdminModule } from './features/admin/admin.module';
import { SavedJobsModule } from './features/saved-jobs/saved-jobs.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env.development',
      load: [
        appConfig,
        dbConfig,
        jwtConfig,
        mailConfig,
        stripeConfig,
        plansConfig,
      ],
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [dbConfig.KEY],
      useFactory: (db: ReturnType<typeof dbConfig>) => db,
    }),
    UsersModule,
    AuthModule,
    CompaniesModule,
    JobsModule,
    ApplicationsModule,
    CompanyMembersModule,
    MachineCategoriesModule,
    MachinesModule,
    WorkerProfilesModule,
    BillingModule,
    PlansModule,
    SubscriptionLimitsModule,
    AdminModule,
    SavedJobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
