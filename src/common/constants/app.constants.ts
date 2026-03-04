// Application-wide constants
export const CURRENT_TIMESTAMP = 'CURRENT_TIMESTAMP';

// Context keys
export const CURRENT_USER_KEY = 'CURRENT_USER';
export const ROLES_KEY = 'role';

// File default upload limits
export const DEFAULT_MAX_FILE_SIZE_MB = 5; // 5MB

export const FILE_SIZE_LIMITS = {
  IMAGE: 2, // 2MB
};

// Allowed file types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

// Pagination defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;
