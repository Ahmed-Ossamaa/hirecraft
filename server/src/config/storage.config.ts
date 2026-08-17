import { registerAs } from '@nestjs/config';
import { Env } from './env.schema';

export default registerAs('storage', () => {
  const env = process.env as unknown as Env;

  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  };
});
