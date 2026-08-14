import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './features/users/users.module';
import { AuthModule } from './features/auth/auth.module';
import { CompaniesModule } from './features/companies/companies.module';
import { WorkersModule } from './features/workers/workers.module';
import { JobsModule } from './features/jobs/jobs.module';
import { ApplicationsModule } from './features/applications/applications.module';
import { CompanyMembersModule } from './features/company-members/company-members.module';
import { ConfigModule } from '@nestjs/config';
import dbConfig from './config/db.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validateEnv } from './config/validate-env';
import { MachineCategoriesModule } from './features/machine-categories/machine-categories.module';
import { MachinesModule } from './features/machines/machines.module';
import appConfig from './config/app.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env.development',
      load: [appConfig, dbConfig, jwtConfig],
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [dbConfig.KEY],
      useFactory: (db: ReturnType<typeof dbConfig>) => db,
    }),
    UsersModule,
    AuthModule,
    CompaniesModule,
    WorkersModule,
    JobsModule,
    ApplicationsModule,
    CompanyMembersModule,
    MachineCategoriesModule,
    MachinesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
