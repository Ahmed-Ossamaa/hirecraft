import { registerAs } from '@nestjs/config';
import { getEnv } from './validate-env';
import { StringValue } from 'ms';

export default registerAs('jwt', () => {
  const env = getEnv();
  return {
    accessSecret: env.JWT_ACCESS_SECRET,
    accessExpires: env.JWT_ACCESS_EXPIRES_IN as StringValue,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpires: env.JWT_REFRESH_EXPIRES_IN as StringValue,
  };
});
