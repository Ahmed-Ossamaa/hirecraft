import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  apiKey: process.env.BREVO_API_KEY,
  apiUrl: process.env.BREVO_API_URL || 'https://api.brevo.com/v3/smtp/email',
  senderEmail: process.env.MAIL_SENDER_EMAIL || 'noreply@technically.com',
  senderName: process.env.MAIL_SENDER_NAME || 'Technically Team',
}));
