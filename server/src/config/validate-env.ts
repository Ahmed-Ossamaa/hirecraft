import { z } from 'zod';
import { Env, envSchema } from './env.schema';

let validatedEnv: Env;

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    console.error(
      'Invalid environment variables:\n',
      z.prettifyError(result.error),
    );
    throw new Error('Invalid environment variables');
  }
  validatedEnv = result.data;
  return result.data;
}

/**
 * Get environment variables
 */
export function getEnv(): Env {
  if (!validatedEnv) {
    throw new Error(
      'Environment not validated yet. Did you forget to load ConfigModule?',
    );
  }

  return validatedEnv;
}
