import {
  Injectable,
  Inject,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { StorageService } from '../../storage.service';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import { CLOUDINARY_FOLDER, StorageProvider } from 'src/common';
import { DeleteFileResponseDto } from '../../dto/delete-file-response.dto';

@Injectable()
export class CloudinaryService implements StorageService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(@Inject('CLOUDINARY') private readonly cloudinary: typeof v2) {}

  private extractPublicId(cloudinaryUrl: string) {
    this.logger.debug(`extractPublicId() received input: ${cloudinaryUrl}`);
    const url = new URL(cloudinaryUrl);
    const pathParts = url.pathname.split('/').filter((part) => part !== '');

    // Find the delivery type index
    const deliveryTypeIndex = pathParts.findIndex((part) =>
      ['upload', 'fetch', 'private', 'authenticated'].includes(part),
    );

    let startIndex = deliveryTypeIndex + 1;

    // Check if there's a version component (starts with 'v' followed by numbers)
    if (pathParts[startIndex] && /^v\d+$/.test(pathParts[startIndex])) {
      startIndex += 1; // Skip the version component
    }

    // Extract public ID and remove file extension
    const publicIdWithExt = pathParts.slice(startIndex).join('/');
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');

    this.logger.debug(`extractPublicId() extracted publicId: ${publicId}`);

    return publicId;
  }

  async upload(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    this.logger.log(
      `upload() started for file: ${file.originalname} (${file.size} bytes)`,
    );

    return new Promise((resolve, reject) => {
      const upload = this.cloudinary.uploader.upload_stream(
        { folder: CLOUDINARY_FOLDER },
        (error, result) => {
          if (error) {
            this.logger.error(
              `upload() failed for file: ${file.originalname}`,
              error.message,
            );

            return reject(new Error(error.message));
          }

          if (!result) {
            this.logger.error(
              `upload() returned undefined result for file: ${file.originalname}`,
            );

            return reject(new Error('Cloudinary upload result is undefined'));
          }

          this.logger.log(`upload() success: ${result.secure_url}`);

          resolve(result);
        },
      );

      upload.end(file.buffer);
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<{
    filename: string;
    path: string;
  }> {
    this.logger.log(`uploadFile() called for: ${file.originalname}`);
    const uploaded = await this.upload(file);

    this.logger.log(`uploadFile() completed for: ${file.originalname}`);

    return { filename: uploaded.url as string, path: uploaded.url as string };
  }

  async uploadFiles(
    files: Express.Multer.File[],
  ): Promise<{ filename: string; path: string }[]> {
    this.logger.log(`uploadFiles() called with ${files.length} files`);
    const uploadPromises = files.map((file) => this.uploadFile(file));

    const uploaded = (await Promise.all(uploadPromises)) as {
      filename: string;
      path: string;
    }[];

    this.logger.log(
      `uploadFiles() completed. Uploaded ${uploaded.length} files`,
    );

    return uploaded;
  }

  async deleteFile(url: string): Promise<DeleteFileResponseDto> {
    this.logger.log(`deleteFile() called with URL: ${url}`);
    const publicId = this.extractPublicId(url);
    this.logger.log(`Extracted public ID: ${publicId} from URL: ${url}`);
    const response = (await this.cloudinary.uploader.destroy(publicId)) as {
      result?: string;
    };

    if (response && response.result === 'ok') {
      this.logger.log(
        `File with public ID ${publicId} deleted successfully from Cloudinary.`,
      );

      return {
        message: `File deleted successfully`,
        url,
        metadata: {
          publicId,
        },
        provider: StorageProvider.CLOUDINARY,
      };
    }

    this.logger.error(
      `Failed to delete file with public ID ${publicId}. Response:`,
      response,
    );
    throw new BadRequestException({
      message: `Failed to delete file with public ID ${publicId}.`,
      response,
    });
  }
}
