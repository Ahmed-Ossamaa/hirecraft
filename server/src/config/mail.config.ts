import { registerAs } from '@nestjs/config';
import { getEnv } from './validate-env';

export default registerAs('mail', () => {
  const env = getEnv();
  return {
    apiKey: env.BREVO_API_KEY,
    apiUrl: env.BREVO_API_URL,
    senderEmail: env.MAIL_SENDER_EMAIL,
    senderName: env.MAIL_SENDER_NAME,
  };
});
