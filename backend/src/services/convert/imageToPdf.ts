import sharp from 'sharp';
import PDFDocument from 'pdfkit';
import path from 'path';
import { ensureDirectoryExists, generateUniqueFilename } from '../../utils/fs';

export interface ImageToPdfOptions {
  pageSize?: 'A4' | 'Letter' | 'Legal';
  margin?: number;
  quality?: number;
}

export async function convertImagesToPdf(
  imageBuffers: Buffer[],
  outputDir: string,
  options: ImageToPdfOptions = {}
): Promise<string> {
  await ensureDirectoryExists(outputDir);
  
  const outputFilename = await generateUniqueFilename('converted', '.pdf');
  const outputPath = path.join(outputDir, outputFilename);
  
  const doc = new PDFDocument({
    size: options.pageSize || 'A4',
    margin: options.margin || 50
  });
  
  const stream = require('fs').createWriteStream(outputPath);
  doc.pipe(stream);
  
  for (let i = 0; i < imageBuffers.length; i++) {
    const imageBuffer = imageBuffers[i];
    const metadata = await sharp(imageBuffer).metadata();
    
    if (!metadata.width || !metadata.height) {
      throw new Error(`Invalid image metadata for image ${i + 1}`);
    }
    
    // Calculate dimensions to fit page
    const pageWidth = doc.page.width - (doc.page.margins.left + doc.page.margins.right);
    const pageHeight = doc.page.height - (doc.page.margins.top + doc.page.margins.bottom);
    
    const aspectRatio = metadata.width / metadata.height;
    let width = pageWidth;
    let height = pageWidth / aspectRatio;
    
    if (height > pageHeight) {
      height = pageHeight;
      width = pageHeight * aspectRatio;
    }
    
    // Add new page for each image (except the first one)
    if (i > 0) {
      doc.addPage();
    }
    
    // Convert image to JPEG buffer for PDF
    const jpegBuffer = await sharp(imageBuffer)
      .jpeg({ quality: options.quality || 80 })
      .toBuffer();
    
    // Add image to PDF
    doc.image(jpegBuffer, {
      fit: [width, height],
      align: 'center',
      valign: 'center'
    });
  }
  
  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
    doc.end();
  });
}

export async function convertSingleImageToPdf(
  imageBuffer: Buffer,
  outputDir: string,
  options: ImageToPdfOptions = {}
): Promise<string> {
  return convertImagesToPdf([imageBuffer], outputDir, options);
}
