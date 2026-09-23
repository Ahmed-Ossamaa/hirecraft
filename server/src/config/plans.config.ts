import { registerAs } from '@nestjs/config';
import { getEnv } from '@/config/validate-env';

export default registerAs('plans', () => {
  const env = getEnv();
  return {
    prices: {
      starterMonthly: env.STRIPE_STARTER_MONTHLY_PRICE_ID || null,
      starterYearly: env.STRIPE_STARTER_YEARLY_PRICE_ID || null,
      proMonthly: env.STRIPE_PRO_MONTHLY_PRICE_ID || null,
      proYearly: env.STRIPE_PRO_YEARLY_PRICE_ID || null,
      enterpriseMonthly: env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || null,
      enterpriseYearly: env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || null,
    },
  };
});
