import {
  BadRequestException,
  applyDecorators,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import {
  ALLOWED_IMAGE_TYPES,
  DEFAULT_MAX_FILE_SIZE_MB,
  FILE_SIZE_LIMITS,
} from '../constants';

export interface FileUploadOptions {
  fieldName?: string;
  maxSize?: number; // in MB
  allowedMimeTypes?: string[];
  description?: string;
}

/**
 * File upload decorator with validation and Swagger documentation
 *
 * @param options - Configuration options
 * @returns Decorator that includes FileInterceptor, ApiConsumes, and ApiBody
 * ```
 */
export function FileUpload(options: FileUploadOptions = {}) {
  const {
    fieldName = 'file',
    maxSize = DEFAULT_MAX_FILE_SIZE_MB,
    allowedMimeTypes,
    description = 'File upload',
  } = options;

  const maxSizeBytes = maxSize * 1024 * 1024;

  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
        limits: { fileSize: maxSizeBytes },
        fileFilter: (req, file, callback) => {
          const isAllowed = allowedMimeTypes
            ? allowedMimeTypes.some((mime) =>
                file.mimetype.match(new RegExp(mime.replace('*', '.*'))),
              )
            : true;

          if (!isAllowed) {
            callback(
              new BadRequestException(
                `Only ${allowedMimeTypes!.join(', ')} files are allowed! (Max: ${maxSize}MB)`,
              ),
              false,
            );
          } else {
            callback(null, true);
          }
        },
      }),
    ),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: `${description} (Allowed: ${allowedMimeTypes ? allowedMimeTypes.join(', ') : 'All file formats allowed'}, Max: ${maxSize}MB)`,
      schema: {
        type: 'object',
        properties: {
          [fieldName]: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
  );
}

/**
 * Shortcut decorator for image upload (jpg, jpeg, png, webp, gif)
 *
 * @param maxSize - Maximum file size in MB
 */
export function ImageUpload(maxSize = FILE_SIZE_LIMITS.IMAGE) {
  return FileUpload({
    maxSize,
    allowedMimeTypes: ALLOWED_IMAGE_TYPES,
    description: 'Image upload',
  });
}
