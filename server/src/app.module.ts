import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { WorkersModule } from './modules/workers/workers.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { CompanyMembersModule } from './modules/company-members/company-members.module';
import { ConfigModule } from '@nestjs/config';
import dbConfig from './config/db.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validateEnv } from './config/validate-env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env.development',
      load: [dbConfig],
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [dbConfig.KEY],
      useFactory: (db: ReturnType<typeof dbConfig>) => {
        if (db.url) {
          return {
            type: 'postgres',
            url: db.url,
            autoLoadEntities: db.autoLoadEntities,
            synchronize: db.synchronize,
          };
        }

        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.user,
          password: db.pass,
          database: db.name,
          autoLoadEntities: db.autoLoadEntities,
          synchronize: db.synchronize,
        };
      },
    }),
    UsersModule,
    AuthModule,
    CompaniesModule,
    WorkersModule,
    JobsModule,
    ApplicationsModule,
    CompanyMembersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
