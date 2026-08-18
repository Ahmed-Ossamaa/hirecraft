import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ImageValidationPipe implements PipeTransform {
  // Max size 5MB
  private readonly maxSize = 5 * 1024 * 1024;
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  transform(value: Express.Multer.File) {
    if (!value) {
      throw new BadRequestException('Image file is required.');
    }

    if (!this.allowedMimeTypes.includes(value.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types are: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    if (value.size > this.maxSize) {
      throw new BadRequestException(`File size exceeds the 5MB limit.`);
    }

    return value;
  }
}
