import { registerAs } from '@nestjs/config';
import { getEnv } from './validate-env';

export default registerAs('db', () => {
  const env = getEnv();
  return {
    url: env.DATABASE_URL,
    host: env.DATABASE_HOST,
    port: Number(env.DATABASE_PORT),
    user: env.DATABASE_USER,
    pass: env.DATABASE_PASSWORD,
    name: env.DATABASE_NAME,
    autoLoadEntities: env.DATABASE_AUTO_LOAD_ENTITIES === 'true',
    synchronize: false,
    timezone: 'Z',
  };
});
