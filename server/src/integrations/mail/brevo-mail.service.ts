import { Injectable, Logger, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import mailConfig from '../../config/mail.config';
import { MailService } from './mail.interface';

@Injectable()
export class BrevoMailService implements MailService {
  private readonly logger = new Logger(BrevoMailService.name);

  constructor(
    @Inject(mailConfig.KEY)
    private readonly config: ConfigType<typeof mailConfig>,
  ) {}

  async sendEmail(
    toEmail: string,
    toName: string,
    subject: string,
    html: string,
  ): Promise<boolean> {
    if (!this.config.apiKey) {
      this.logger.warn(`BREVO_API_KEY is not set. Email was not sent`);
      return false;
    }

    const payload = {
      sender: {
        name: this.config.senderName,
        email: this.config.senderEmail,
      },
      to: [{ email: toEmail, name: toName }],
      subject,
      htmlContent: html,
    };

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.config.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let message = `Brevo API returned ${response.status}`;
        try {
          const errorData = JSON.parse(errorText) as { message?: string };
          message = errorData.message ?? errorText;
        } catch {
          message = errorText || message;
        }

        throw new Error(message);
      }

      this.logger.log(`Email sent successfully to ${toEmail}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${toEmail}`,
        error instanceof Error ? error.message : error,
      );
      return false;
    }
  }
}
