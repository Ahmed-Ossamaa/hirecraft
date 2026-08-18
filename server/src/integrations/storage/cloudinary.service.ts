import { Injectable, Inject, Logger, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import type { ConfigType } from '@nestjs/config';
import storageConfig from '@/config/storage.config';
import { IStorageService, UploadImageOptions } from './storage.interface';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService implements IStorageService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(
    @Inject(storageConfig.KEY)
    private readonly config: ConfigType<typeof storageConfig>,
  ) {
    if (!this.config.cloudName || !this.config.apiKey || !this.config.apiSecret) {
      this.logger.warn('Cloudinary credentials are not fully configured in environment variables.');
    }

    cloudinary.config({
      cloud_name: this.config.cloudName,
      api_key: this.config.apiKey,
      api_secret: this.config.apiSecret,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    options: UploadImageOptions,
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          public_id: options.publicId,
          overwrite: options.overwrite ?? true,
        },
        (error, result) => {
          if (error) {
            this.logger.error(`Cloudinary upload failed: ${error.message}`, error);
            return reject(new InternalServerErrorException('Failed to upload media.'));
          }
          if (!result) {
            return reject(new InternalServerErrorException('Cloudinary upload returned no result.'));
          }
          
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      const readableStream = new Readable({
        read() {
          this.push(file.buffer);
          this.push(null);
        },
      });

      readableStream.pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      if (result.result !== 'ok' && result.result !== 'not found') {
        this.logger.warn(`Cloudinary deletion returned unexpected result for ${publicId}: ${result.result}`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to delete media from Cloudinary (publicId: ${publicId})`, error);
      throw new InternalServerErrorException('Failed to delete media.');
    }
  }
}
