import {
  Injectable,
  Inject,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';
import type { ConfigType } from '@nestjs/config';
import storageConfig from '@/config/storage.config';
import {
  IStorageService,
  UploadImageOptions,
  UploadImageResult,
  ImageUploadType,
} from './storage.interface';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService implements IStorageService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(
    @Inject(storageConfig.KEY)
    private readonly config: ConfigType<typeof storageConfig>,
  ) {
    cloudinary.config({
      cloud_name: this.config.cloudName,
      api_key: this.config.apiKey,
      api_secret: this.config.apiSecret,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    options: UploadImageOptions,
  ): Promise<UploadImageResult> {
    return new Promise((resolve, reject) => {
      const uploadOptions: UploadApiOptions = {
        folder: options.folder,
        public_id: options.publicId,
        overwrite: options.overwrite ?? true,
        ...this.getImageTransformations(options.type),
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            this.logger.error(
              `Cloudinary upload failed: ${error.message}`,
              error,
            );
            return reject(
              new InternalServerErrorException('Failed to upload media.'),
            );
          }
          if (!result) {
            return reject(
              new InternalServerErrorException(
                'Cloudinary upload returned no result.',
              ),
            );
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      const stream = Readable.from(file.buffer);
      stream.on('error', (error) => {
        this.logger.error('Failed to read uploaded file', error);
        reject(
          new InternalServerErrorException('Failed to read uploaded file.'),
        );
      });

      stream.pipe(uploadStream);
    });
  }

  private getImageTransformations(
    type?: ImageUploadType,
  ): Partial<UploadApiOptions> {
    if (!type) {
      return {};
    }

    switch (type) {
      case 'avatar':
        return {
          width: 250,
          height: 250,
          crop: 'fill',
          gravity: 'face',
          fetch_format: 'auto',
          quality: 'auto',
        };
      case 'company_logo':
        return {
          fetch_format: 'auto',
          quality: 'auto',
          // crop: 'fit',
        };
      case 'company_cover':
        return {
          width: 1200,
          height: 300,
          crop: 'fill',
          gravity: 'center',
          fetch_format: 'auto',
          quality: 'auto',
        };
      case 'standard':
        return {
          width: 1920,
          crop: 'limit',
          fetch_format: 'auto',
          quality: 'auto',
        };
      default:
        return {};
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      const response = (await cloudinary.uploader.destroy(publicId)) as {
        result: string;
      };
      if (response.result !== 'ok' && response.result !== 'not found') {
        this.logger.warn(
          `Cloudinary deletion returned unexpected result for ${publicId}: ${response.result}`,
        );
      }
    } catch (error) {
      const err = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to delete media from Cloudinary (publicId: ${publicId})`,
        err,
      );
      throw new InternalServerErrorException('Failed to delete media.');
    }
  }
}
