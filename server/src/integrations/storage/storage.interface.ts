export type ImageUploadType = 'avatar' | 'company_logo' | 'document' | 'other';

export interface UploadImageOptions {
  folder: string;
  publicId?: string;
  overwrite?: boolean;
  type?: ImageUploadType;
}

export interface IStorageService {
  uploadFile(
    file: Express.Multer.File,
    options: UploadImageOptions,
  ): Promise<{ url: string; publicId: string }>;
  
  deleteFile(publicId: string): Promise<void>;
}

export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');
