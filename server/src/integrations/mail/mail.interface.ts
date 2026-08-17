export const MAIL_SERVICE = Symbol('MAIL_SERVICE');

export interface MailService {
  sendEmail(
    toEmail: string,
    toName: string,
    subject: string,
    html: string,
  ): Promise<boolean>;
}
