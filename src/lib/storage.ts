import { supabase } from "@/integrations/supabase/client";

/**
 * Storage bucket configuration
 */
export const STORAGE_BUCKETS = {
  notes: {
    name: "notes",
    maxSize: 52428800, // 50MB
    allowedTypes: ["application/pdf"],
  },
  thumbnails: {
    name: "thumbnails",
    maxSize: 5242880, // 5MB
    allowedTypes: ["image/png", "image/jpeg", "image/webp"],
  },
  grades: {
    name: "grades",
    maxSize: 5242880, // 5MB
    allowedTypes: ["image/png", "image/jpeg", "text/csv"],
  },
  avatars: {
    name: "avatars",
    maxSize: 2097152, // 2MB
    allowedTypes: ["image/png", "image/jpeg", "image/webp"],
  },
} as const;

export type StorageBucket = keyof typeof STORAGE_BUCKETS;

/**
 * Validate file before upload
 */
export const validateFile = (
  file: File,
  bucket: StorageBucket
): { valid: boolean; error?: string } => {
  const config = STORAGE_BUCKETS[bucket];

  if (file.size > config.maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${(config.maxSize / 1048576).toFixed(0)}MB limit`,
    };
  }

  if (!config.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${config.allowedTypes.join(", ")}`,
    };
  }

  return { valid: true };
};

/**
 * Upload file to storage bucket
 */
export const uploadFile = async (
  bucket: StorageBucket,
  path: string,
  file: File
): Promise<{ data: { path: string } | null; error: Error | null }> => {
  const validation = validateFile(file, bucket);
  if (!validation.valid) {
    return { data: null, error: new Error(validation.error) };
  }

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket].name)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  return { data, error };
};

/**
 * Get public URL for a file
 */
export const getPublicUrl = (bucket: StorageBucket, path: string): string => {
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS[bucket].name)
    .getPublicUrl(path);

  return data.publicUrl;
};

/**
 * Get signed URL for private files (expires in 1 hour by default)
 */
export const getSignedUrl = async (
  bucket: StorageBucket,
  path: string,
  expiresIn: number = 3600
): Promise<{ data: { signedUrl: string } | null; error: Error | null }> => {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket].name)
    .createSignedUrl(path, expiresIn);

  return { data, error };
};

/**
 * Delete file from storage
 */
export const deleteFile = async (
  bucket: StorageBucket,
  path: string
): Promise<{ error: Error | null }> => {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket].name)
    .remove([path]);

  return { error };
};

/**
 * Generate storage path for user files
 */
export const generateStoragePath = (
  userId: string,
  fileName: string,
  subfolder?: string
): string => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  
  if (subfolder) {
    return `${userId}/${subfolder}/${timestamp}_${sanitizedFileName}`;
  }
  
  return `${userId}/${timestamp}_${sanitizedFileName}`;
};
