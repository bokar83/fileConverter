import sharp from 'sharp';
import path from 'path';
import { ensureDirectoryExists, generateUniqueFilename, writeFile } from '../../utils/fs';

export interface ImageConversionOptions {
  quality?: number;
  width?: number;
  height?: number;
}

export async function convertImageToImage(
  inputBuffer: Buffer,
  inputFormat: string,
  outputFormat: string,
  outputDir: string,
  options: ImageConversionOptions = {}
): Promise<string> {
  await ensureDirectoryExists(outputDir);
  
  const outputFilename = await generateUniqueFilename('converted', `.${outputFormat}`);
  const outputPath = path.join(outputDir, outputFilename);
  
  let sharpInstance = sharp(inputBuffer);
  
  // Set quality based on format and options
  const quality = options.quality || getDefaultQuality(outputFormat);
  
  // Apply resizing if specified
  if (options.width || options.height) {
    sharpInstance = sharpInstance.resize(options.width, options.height, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }
  
  // Convert based on output format
  switch (outputFormat.toLowerCase()) {
    case 'jpeg':
    case 'jpg':
      await sharpInstance
        .jpeg({ quality, progressive: true })
        .toFile(outputPath);
      break;
      
    case 'png':
      await sharpInstance
        .png({ quality, progressive: true })
        .toFile(outputPath);
      break;
      
    case 'webp':
      await sharpInstance
        .webp({ quality })
        .toFile(outputPath);
      break;
      
    case 'tiff':
      await sharpInstance
        .tiff({ quality })
        .toFile(outputPath);
      break;
      
    default:
      throw new Error(`Unsupported output format: ${outputFormat}`);
  }
  
  return outputPath;
}

function getDefaultQuality(format: string): number {
  switch (format.toLowerCase()) {
    case 'jpeg':
    case 'jpg':
      return 80;
    case 'png':
      return 80;
    case 'webp':
      return 80;
    case 'tiff':
      return 90;
    default:
      return 80;
  }
}

export async function getImageMetadata(buffer: Buffer): Promise<{
  width: number;
  height: number;
  format: string;
  size: number;
}> {
  const metadata = await sharp(buffer).metadata();
  
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    size: buffer.length
  };
}
