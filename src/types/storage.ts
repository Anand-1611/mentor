/**
 * Storage bucket names
 */
export type StorageBucket = "notes" | "thumbnails" | "grades" | "avatars";

/**
 * File upload result
 */
export interface FileUploadResult {
  path: string;
  url: string;
}

/**
 * File validation result
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Storage bucket configuration
 */
export interface StorageBucketConfig {
  name: string;
  maxSize: number;
  allowedTypes: string[];
}

/**
 * Upload progress callback
 */
export type UploadProgressCallback = (progress: number) => void;
