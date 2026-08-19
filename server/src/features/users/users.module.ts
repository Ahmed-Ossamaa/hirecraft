import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from './infrastructure/user.orm-entity';
import { USER_REPOSITORY } from './domain/user.repo.interface';
import { UserTypeormRepository } from './infrastructure/user.typeorm.repo';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { MailModule } from '@/integrations/mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity]), MailModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USER_REPOSITORY,
      useClass: UserTypeormRepository,
    },
    UsersService,
    JwtStrategy,
  ],
  exports: [USER_REPOSITORY, UsersService],
})
export class UsersModule {}
