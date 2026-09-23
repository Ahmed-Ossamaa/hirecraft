import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';

/**
 * - Decorator for handling file uploads with Swagger documentation.
 * - Automatically sets up FileInterceptor and Swagger API documentation for file uploads.
 */
export function ApiImageUpload(fieldName: string = 'file'): MethodDecorator {
  return applyDecorators(
    UseInterceptors(FileInterceptor(fieldName)),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fieldName]: {
            type: 'string',
            format: 'binary',
            description: 'Image file to upload',
          },
        },
      },
    }),
  );
}
