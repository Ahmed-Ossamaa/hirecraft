import { registerAs } from '@nestjs/config';
import { getEnv } from '@/config/validate-env';

export default registerAs('stripe', () => {
  const env = getEnv();
  return {
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    successUrl:
      env.STRIPE_SUCCESS_URL ||
      'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
    cancelUrl: env.STRIPE_CANCEL_URL || 'http://localhost:3000/cancel',
  };
});
