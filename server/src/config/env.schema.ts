import { z } from 'zod';

export const envSchema = z
  .object({
    CLIENT_URL: z.string(),
    BASE_URL: z.string().default('http://localhost:5000'),
    API_PREFIX: z.string().default('api/v1'),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z.coerce.number().default(5000),
    // Database
    DATABASE_URL: z.string().optional(),
    DATABASE_HOST: z.string().optional(),
    DATABASE_PORT: z.coerce.number().default(5432),
    DATABASE_USER: z.string().optional(),
    DATABASE_PASSWORD: z.string().optional(),
    DATABASE_NAME: z.string().optional(),
    DATABASE_AUTO_LOAD_ENTITIES: z.enum(['true', 'false']).default('false'),

    // JWT
    JWT_ACCESS_SECRET: z.string().min(10),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_SECRET: z.string().min(10),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    // Mail
    BREVO_API_KEY: z.string().optional(),
    BREVO_API_URL: z.string().default('https://api.brevo.com/v3/smtp/email'),
    MAIL_SENDER_EMAIL: z.email().default('noreply@technically.com'),
    MAIL_SENDER_NAME: z.string().default('Technically Team'),

    // Storage (Cloudinary)
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),

    // Billing (Stripe)
    STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
    STRIPE_WEBHOOK_SECRET: z
      .string()
      .min(1, 'STRIPE_WEBHOOK_SECRET is required'),
    STRIPE_SUCCESS_URL: z.string(),
    STRIPE_CANCEL_URL: z.string(),
    STRIPE_STARTER_MONTHLY_PRICE_ID: z.string(),
    STRIPE_STARTER_YEARLY_PRICE_ID: z.string(),
    STRIPE_PRO_MONTHLY_PRICE_ID: z.string(),
    STRIPE_PRO_YEARLY_PRICE_ID: z.string(),
    STRIPE_ENTERPRISE_MONTHLY_PRICE_ID: z.string(),
    STRIPE_ENTERPRISE_YEARLY_PRICE_ID: z.string(),
  })
  .refine(
    (env) => {
      const hasUrl = Boolean(env.DATABASE_URL);
      const hasComponents = Boolean(
        env.DATABASE_HOST &&
        env.DATABASE_USER &&
        env.DATABASE_PASSWORD &&
        env.DATABASE_NAME,
      );
      return hasUrl || hasComponents;
    },
    {
      message:
        'You must provide either DATABASE_URL or all individual database variables (HOST, USER, PASSWORD, NAME).',
    },
  );

export type Env = z.infer<typeof envSchema>;
