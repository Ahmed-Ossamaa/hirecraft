export type ImageUploadType =
  'avatar' | 'company_logo' | 'company_cover' | 'standard';

export interface UploadImageOptions {
  folder: string;
  publicId?: string;
  overwrite?: boolean;
  type?: ImageUploadType;
}

export interface UploadImageResult {
  url: string;
  publicId: string;
}

export interface IStorageService {
  uploadImage(
    file: Express.Multer.File,
    options: UploadImageOptions,
  ): Promise<UploadImageResult>;

  deleteFile(publicId: string): Promise<void>;
}

export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');
