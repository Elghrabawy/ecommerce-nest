import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class StorageService {
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

  /**
   * function for deleting file from the storage provider
   * @param filename name of the file to delete
   * @returns result of the delete operation
   */
  abstract deleteFile(url: string): Promise<any>;
}
