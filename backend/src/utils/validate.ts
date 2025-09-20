import { Request } from 'express';

export interface ConversionPair {
  input: string;
  output: string;
}

const DOCUMENT_FORMATS = ['docx', 'xlsx', 'pptx', 'txt'] as const;
const IMAGE_FORMATS = ['jpeg', 'jpg', 'png', 'webp', 'tiff', 'gif', 'bmp'] as const;
const PDF_FORMATS = ['pdf'] as const;
const VIDEO_FORMATS = ['mp4', 'mov', 'avi', 'mkv', 'webm'] as const;

export const SUPPORTED_FORMATS = {
  documents: DOCUMENT_FORMATS,
  images: IMAGE_FORMATS,
  pdf: PDF_FORMATS,
  videos: VIDEO_FORMATS
} as const;

const BASE_CONVERSION_PAIRS: ConversionPair[] = [
  // Document to PDF
  { input: 'docx', output: 'pdf' },
  { input: 'xlsx', output: 'pdf' },
  { input: 'pptx', output: 'pdf' },
  { input: 'txt', output: 'pdf' },

  // Image to Image
  { input: 'jpeg', output: 'png' },
  { input: 'jpg', output: 'png' },
  { input: 'png', output: 'jpeg' },
  { input: 'jpeg', output: 'webp' },
  { input: 'jpg', output: 'webp' },
  { input: 'png', output: 'webp' },
  { input: 'webp', output: 'jpeg' },
  { input: 'webp', output: 'png' },
  { input: 'png', output: 'tiff' },
  { input: 'tiff', output: 'png' },
  { input: 'gif', output: 'png' },
  { input: 'bmp', output: 'png' },
  { input: 'gif', output: 'jpeg' },
  { input: 'bmp', output: 'jpeg' },

  // PDF to Image
  { input: 'pdf', output: 'png' },
  { input: 'pdf', output: 'jpeg' },

  // Image to PDF
  { input: 'jpeg', output: 'pdf' },
  { input: 'jpg', output: 'pdf' },
  { input: 'png', output: 'pdf' },
  { input: 'webp', output: 'pdf' },
  { input: 'tiff', output: 'pdf' },
  { input: 'gif', output: 'pdf' },
  { input: 'bmp', output: 'pdf' }
];

const VIDEO_CONVERSION_PAIRS: ConversionPair[] = VIDEO_FORMATS.flatMap(input =>
  VIDEO_FORMATS
    .filter(output => output !== input)
    .map(output => ({ input, output }))
);

export const CONVERSION_PAIRS: ConversionPair[] = [
  ...BASE_CONVERSION_PAIRS,
  ...VIDEO_CONVERSION_PAIRS
];

export const MIME_TYPES = {
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'text/plain': 'txt',
  'application/pdf': 'pdf',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/tiff': 'tiff',
  'image/gif': 'gif',
  'image/bmp': 'bmp',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/x-msvideo': 'avi',
  'video/x-matroska': 'mkv',
  'video/webm': 'webm'
} as const;

export function getFileExtension(filename: string): string {
  const normalized = filename.toLowerCase();
  const lastDotIndex = normalized.lastIndexOf('.');

  if (lastDotIndex === -1 || lastDotIndex === normalized.length - 1) {
    return '';
  }

  return normalized.slice(lastDotIndex + 1);
}

export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename);
  const mimeMap: Record<string, string> = {
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'pdf': 'application/pdf',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'tiff': 'image/tiff',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'mkv': 'video/x-matroska',
    'webm': 'video/webm'
  };
  return mimeMap[ext] || 'application/octet-stream';
}

export function isValidConversion(inputExt: string, outputExt: string): boolean {
  return CONVERSION_PAIRS.some(pair => 
    pair.input === inputExt.toLowerCase() && pair.output === outputExt.toLowerCase()
  );
}

export function getAvailableOutputFormats(inputExt: string): string[] {
  return CONVERSION_PAIRS
    .filter(pair => pair.input === inputExt.toLowerCase())
    .map(pair => pair.output);
}

export function validateFileType(filename: string, mimeType: string): { valid: boolean; extension: string; error?: string } {
  const extension = getFileExtension(filename);
  const expectedMimeType = getMimeType(filename);
  
  if (!extension) {
    return { valid: false, extension: '', error: 'File must have an extension' };
  }
  
  if (mimeType !== expectedMimeType) {
    return { valid: false, extension, error: `MIME type mismatch. Expected ${expectedMimeType}, got ${mimeType}` };
  }
  
  const allSupportedExtensions: string[] = [
    ...SUPPORTED_FORMATS.documents,
    ...SUPPORTED_FORMATS.images,
    ...SUPPORTED_FORMATS.pdf,
    ...SUPPORTED_FORMATS.videos
  ];
  
  if (!allSupportedExtensions.includes(extension)) {
    return { valid: false, extension, error: `Unsupported file type: ${extension}` };
  }
  
  return { valid: true, extension };
}

export function validateFileSize(size: number, maxSizeMB: number): { valid: boolean; error?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (size > maxSizeBytes) {
    return { 
      valid: false, 
      error: `File size ${(size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${maxSizeMB}MB` 
    };
  }
  
  return { valid: true };
}

export function sanitizeFilename(filename: string): string {
  // Remove or replace dangerous characters
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
}

export function validateConversionRequest(files: Express.Multer.File[], targetFormat: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!files || files.length === 0) {
    errors.push('No files provided');
    return { valid: false, errors };
  }
  
  if (!targetFormat) {
    errors.push('Target format is required');
    return { valid: false, errors };
  }
  
  for (const file of files) {
    const validation = validateFileType(file.originalname, file.mimetype);
    if (!validation.valid) {
      errors.push(`${file.originalname}: ${validation.error}`);
      continue;
    }
    
    if (!isValidConversion(validation.extension, targetFormat)) {
      const availableFormats = getAvailableOutputFormats(validation.extension);
      errors.push(`${file.originalname}: Cannot convert ${validation.extension} to ${targetFormat}. Available formats: ${availableFormats.join(', ')}`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}



