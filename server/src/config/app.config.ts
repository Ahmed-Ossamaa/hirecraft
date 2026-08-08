import { registerAs } from '@nestjs/config';
import { getEnv } from './validate-env';

export default registerAs('app', () => {
  const env = getEnv();
  return {
    clientURL: env.CLIENT_URL,
    baseUrl: env.BASE_URL,
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
  };
});
