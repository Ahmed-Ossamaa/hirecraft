import { z } from 'zod';

export const envSchema = z.object({
  CLIENT_URL: z.string(),
  BASE_URL: z.string().default('http://localhost:5000'),
  API_PREFIX: z.string().default('api'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(5000),

  DATABASE_URL: z.string().optional(),
  DATABASE_HOST: z.string().optional(),
  DATABASE_PORT: z.coerce.number().default(5432),
  DATABASE_USER: z.string().optional(),
  DATABASE_PASSWORD: z.string().optional(),
  DATABASE_NAME: z.string().optional(),
  DATABASE_AUTO_LOAD_ENTITIES: z.enum(['true', 'false']).default('false'),
});
