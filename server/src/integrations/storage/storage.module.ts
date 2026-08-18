import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import storageConfig from '@/config/storage.config';
import { STORAGE_SERVICE } from './storage.interface';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [ConfigModule.forFeature(storageConfig)],
  providers: [
    {
      provide: STORAGE_SERVICE,
      useClass: CloudinaryService,
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
