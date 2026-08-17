import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import mailConfig from '../../config/mail.config';
import { MAIL_SERVICE } from './mail.interface';
import { BrevoMailService } from './brevo-mail.service';
import { MailListener } from './mail.listener';

@Module({
  imports: [ConfigModule.forFeature(mailConfig)],
  providers: [
    {
      provide: MAIL_SERVICE,
      useClass: BrevoMailService,
    },
    MailListener,
  ],
  exports: [MAIL_SERVICE],
})
export class MailModule {}
