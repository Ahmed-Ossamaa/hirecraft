import { registerAs } from '@nestjs/config';
import { getEnv } from './validate-env';

export default registerAs('db', () => {
  const env = getEnv();

  const commonConfig = {
    type: 'postgres' as const,
    autoLoadEntities: env.DATABASE_AUTO_LOAD_ENTITIES === 'true',
    synchronize: env.NODE_ENV !== 'production',
    timezone: 'Z',
  };

  if (env.DATABASE_URL) {
    return {
      ...commonConfig,
      url: env.DATABASE_URL,
    };
  }

  return {
    ...commonConfig,
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    username: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
  };
});
