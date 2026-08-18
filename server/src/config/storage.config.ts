import { registerAs } from '@nestjs/config';
import { getEnv } from './validate-env';

export default registerAs('storage', () => {
  const env = getEnv();

  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  };
});
