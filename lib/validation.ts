// -------------------------------------------------------------------------
// Input validation helpers used at the API boundary. Pure functions with no
// I/O so they are trivially unit-testable.
//
// NOTE: `validateImageUpload` is exported and correct, but the upload route
// (app/api/upload/route.ts) deliberately does NOT call it — that is one of the
// two intentional issues this teaching sample ships. The "fix" is to call it.
// -------------------------------------------------------------------------

export const MAX_POST_LENGTH = 280;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
] as const;

export interface ValidationResult<T> {
  ok: boolean;
  value?: T;
  error?: string;
}

export interface CreatePostFields {
  text: string;
  imageUrl: string | null;
}

/**
 * Validate a create-post request body. Text must be a non-empty string within
 * MAX_POST_LENGTH; imageUrl (if present) must be a relative /uploads path.
 */
export function validateCreatePost(input: unknown): ValidationResult<CreatePostFields> {
  if (typeof input !== 'object' || input === null) {
    return { ok: false, error: 'Request body must be a JSON object.' };
  }
  const body = input as Record<string, unknown>;

  const rawText = body.text;
  if (typeof rawText !== 'string') {
    return { ok: false, error: 'Field "text" is required and must be a string.' };
  }
  const text = rawText.trim();
  if (text.length === 0) {
    return { ok: false, error: 'Post text cannot be empty.' };
  }
  if (text.length > MAX_POST_LENGTH) {
    return {
      ok: false,
      error: `Post text must be ${MAX_POST_LENGTH} characters or fewer.`,
    };
  }

  let imageUrl: string | null = null;
  if (body.imageUrl !== undefined && body.imageUrl !== null) {
    if (typeof body.imageUrl !== 'string') {
      return { ok: false, error: 'Field "imageUrl" must be a string when present.' };
    }
    const url = body.imageUrl.trim();
    if (url.length > 0) {
      if (!url.startsWith('/uploads/')) {
        return { ok: false, error: 'imageUrl must reference an uploaded file.' };
      }
      imageUrl = url;
    }
  }

  return { ok: true, value: { text, imageUrl } };
}

export interface ImageUploadMeta {
  contentType: string;
  size: number;
}

/**
 * Validate an uploaded image's content-type and size. Returns a safe file
 * extension on success.
 *
 * The upload route intentionally skips calling this (see file header).
 */
export function validateImageUpload(
  file: ImageUploadMeta,
): ValidationResult<{ ext: string }> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.contentType as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return {
      ok: false,
      error: `Unsupported image type "${file.contentType}".`,
    };
  }
  if (file.size <= 0) {
    return { ok: false, error: 'Uploaded file is empty.' };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `Uploaded file exceeds ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB limit.`,
    };
  }
  return { ok: true, value: { ext: extForType(file.contentType) } };
}

export function extForType(contentType: string): string {
  switch (contentType) {
    case 'image/png':
      return 'png';
    case 'image/jpeg':
      return 'jpg';
    case 'image/gif':
      return 'gif';
    case 'image/webp':
      return 'webp';
    case 'image/svg+xml':
      return 'svg';
    default:
      return 'bin';
  }
}
