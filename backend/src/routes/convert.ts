import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { 
  validateConversionRequest, 
  validateFileSize, 
  sanitizeFilename,
  getFileExtension 
} from '../utils/validate';
import { convertImageToImage } from '../services/convert/imageToImage';
import { convertImagesToPdf, convertSingleImageToPdf } from '../services/convert/imageToPdf';
import { convertDocToPdf } from '../services/convert/docToPdf';
import { convertPdfToImages } from '../services/convert/pdfToImage';
import { ensureDirectoryExists, generateUniqueFilename } from '../utils/fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '50') * 1024 * 1024,
    files: 10 // Max 10 files per request
  }
});

import { storageService } from '../services/storage';

router.post('/', upload.array('files'), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const targetFormat = req.body.targetFormat as string;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }
    
    if (!targetFormat) {
      return res.status(400).json({ error: 'Target format is required' });
    }
    
    // Validate request
    const validation = validateConversionRequest(files, targetFormat);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.errors 
      });
    }
    
    // Validate file sizes
    const maxSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '50');
    for (const file of files) {
      const sizeValidation = validateFileSize(file.size, maxSizeMB);
      if (!sizeValidation.valid) {
        return res.status(400).json({ 
          error: 'File size validation failed', 
          details: [sizeValidation.error] 
        });
      }
    }
    
    const results = [];
    const tmpDir = process.env.TMP_DIR || path.join(process.cwd(), 'tmp');
    await ensureDirectoryExists(tmpDir);
    
    for (const file of files) {
      try {
        const inputExt = getFileExtension(file.originalname);
        const result = await convertFile(file, inputExt, targetFormat, tmpDir);
        
        // Store result for download
        const resultId = uuidv4();
        storageService.set(resultId, {
          filePath: result.filePath,
          originalName: file.originalname,
          convertedName: result.convertedName,
          mimeType: result.mimeType,
          createdAt: new Date()
        });
        
        results.push({
          id: resultId,
          originalName: file.originalname,
          convertedName: result.convertedName,
          downloadUrl: `/api/download/${resultId}`,
          size: result.size
        });
      } catch (error) {
        console.error(`Conversion failed for ${file.originalname}:`, error);
        results.push({
          originalName: file.originalname,
          error: error instanceof Error ? error.message : 'Conversion failed'
        });
      }
    }
    
    res.json({
      success: true,
      results,
      message: `Converted ${results.filter(r => !r.error).length} of ${files.length} files`
    });
    
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ 
      error: 'Conversion failed', 
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

async function convertFile(
  file: Express.Multer.File,
  inputExt: string,
  targetFormat: string,
  tmpDir: string
): Promise<{
  filePath: string;
  convertedName: string;
  mimeType: string;
  size: number;
}> {
  const outputDir = path.join(tmpDir, 'output');
  await ensureDirectoryExists(outputDir);
  
  const sanitizedOriginalName = sanitizeFilename(file.originalname);
  const baseName = path.parse(sanitizedOriginalName).name;
  const convertedName = `${baseName}.${targetFormat}`;
  
  let outputPath: string;
  let mimeType: string;
  
  // Determine conversion type and execute
  if (['docx', 'xlsx', 'pptx', 'txt'].includes(inputExt) && targetFormat === 'pdf') {
    // Document to PDF
    outputPath = await convertDocToPdf(file.buffer, inputExt, outputDir);
    mimeType = 'application/pdf';
  } else if (inputExt === 'pdf' && ['png', 'jpeg'].includes(targetFormat)) {
    // PDF to Image
    outputPath = await convertPdfToImages(file.buffer, outputDir, {
      format: targetFormat as 'png' | 'jpeg',
      quality: 80,
      dpi: 150
    });
    mimeType = targetFormat === 'png' ? 'image/png' : 'image/jpeg';
  } else if (['jpeg', 'jpg', 'png', 'webp', 'tiff', 'gif', 'bmp'].includes(inputExt) && targetFormat === 'pdf') {
    // Image to PDF
    outputPath = await convertSingleImageToPdf(file.buffer, outputDir);
    mimeType = 'application/pdf';
  } else if (['jpeg', 'jpg', 'png', 'webp', 'tiff', 'gif', 'bmp'].includes(inputExt) && 
             ['jpeg', 'jpg', 'png', 'webp', 'tiff'].includes(targetFormat)) {
    // Image to Image
    outputPath = await convertImageToImage(file.buffer, inputExt, targetFormat, outputDir);
    mimeType = getMimeTypeForFormat(targetFormat);
  } else {
    throw new Error(`Unsupported conversion: ${inputExt} to ${targetFormat}`);
  }
  
  // Get file size
  const fs = require('fs');
  const stats = fs.statSync(outputPath);
  
  return {
    filePath: outputPath,
    convertedName,
    mimeType,
    size: stats.size
  };
}

function getMimeTypeForFormat(format: string): string {
  const mimeMap: Record<string, string> = {
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'tiff': 'image/tiff'
  };
  return mimeMap[format] || 'application/octet-stream';
}

export { router as convertRouter };
