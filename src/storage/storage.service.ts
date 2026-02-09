import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class StorageService {
  /**
   * function for storing file to the storage provider
   * @param file file for uploading
   */
  abstract storeFile(file: Express.Multer.File): Promise<void>;

  /**
   * function for uploading file to the storage provider
   * @param file file to upload
   * @retruns uploaded file information
   */
  abstract uploadFile(file: Express.Multer.File): Promise<{
    filename: string;
    path: string;
  }>;

  /**
   * function for uploading multiple files to the storage provider
   * @param files list of files to upload
   * @returns list of uploaded files information
   */
  abstract uploadFiles(files: Express.Multer.File[]): Promise<
    {
      filename: string;
      path: string;
    }[]
  >;

  abstract deleteFile(filename: string): Promise<any>;
}
