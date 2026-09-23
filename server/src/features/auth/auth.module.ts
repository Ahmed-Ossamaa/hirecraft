import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { CompaniesModule } from '../companies/companies.module';
import { CompanyMembersModule } from '../company-members/company-members.module';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '@/config/jwt.config';
import { ConfigType } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    CompaniesModule,
    CompanyMembersModule,
    JwtModule.registerAsync({
      inject: [jwtConfig.KEY],
      useFactory: (config: ConfigType<typeof jwtConfig>) => ({
        secret: config.accessSecret,
        signOptions: { expiresIn: config.accessExpires },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
