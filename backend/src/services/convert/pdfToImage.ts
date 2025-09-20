import { spawn } from 'child_process';
import path from 'path';
import archiver from 'archiver';
import { ensureDirectoryExists, generateUniqueFilename, fileExists, deleteFile } from '../../utils/fs';

export interface PdfToImageOptions {
  format: 'png' | 'jpeg';
  quality?: number;
  dpi?: number;
  timeout?: number;
}

export async function convertPdfToImages(
  inputBuffer: Buffer,
  outputDir: string,
  options: PdfToImageOptions
): Promise<string> {
  await ensureDirectoryExists(outputDir);
  
  const inputFilename = await generateUniqueFilename('input', '.pdf');
  const inputPath = path.join(outputDir, inputFilename);
  const outputPrefix = path.join(outputDir, 'page');
  
  // Write input file
  const fs = require('fs');
  fs.writeFileSync(inputPath, inputBuffer);
  
  return new Promise((resolve, reject) => {
    const timeout = options.timeout || 30000; // 30 seconds default
    let timeoutId: NodeJS.Timeout;
    
    // Poppler command
    const command = 'pdftoppm';
    const args = [
      '-r', (options.dpi || 150).toString(),
      '-f', '1', // First page
      '-l', '999', // Last page (all pages)
      inputPath,
      outputPrefix
    ];
    
    if (options.format === 'jpeg') {
      args.push('-jpeg');
    } else {
      args.push('-png');
    }
    
    console.log(`Running pdftoppm: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env }
    });
    
    let stdout = '';
    let stderr = '';
    
    process.stdout?.on('data', (data) => {
      stdout += data.toString();
    });
    
    process.stderr?.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', async (code) => {
      clearTimeout(timeoutId);
      
      // Clean up input file
      try {
        fs.unlinkSync(inputPath);
      } catch (error) {
        console.warn('Failed to clean up input file:', error);
      }
      
      if (code !== 0) {
        console.error('pdftoppm stderr:', stderr);
        reject(new Error(`PDF to image conversion failed with code ${code}: ${stderr}`));
        return;
      }
      
      try {
        // Find all generated image files
        const files = fs.readdirSync(outputDir);
        const imageFiles = files
          .filter((file: string) => file.startsWith('page') && file.endsWith(`.${options.format}`))
          .sort();
        
        if (imageFiles.length === 0) {
          reject(new Error('No images were generated from PDF'));
          return;
        }
        
        if (imageFiles.length === 1) {
          // Single page - return the image file directly
          const imagePath = path.join(outputDir, imageFiles[0]);
          resolve(imagePath);
        } else {
          // Multiple pages - create a zip file
          const zipFilename = await generateUniqueFilename('converted', '.zip');
          const zipPath = path.join(outputDir, zipFilename);
          
          await createZipFile(imageFiles.map(file => path.join(outputDir, file)), zipPath);
          
          // Clean up individual image files
          for (const file of imageFiles) {
            await deleteFile(path.join(outputDir, file));
          }
          
          resolve(zipPath);
        }
      } catch (error) {
        reject(new Error(`Failed to process converted images: ${error}`));
      }
    });
    
    process.on('error', (error) => {
      clearTimeout(timeoutId);
      reject(new Error(`Failed to start pdftoppm: ${error.message}`));
    });
    
    // Set timeout
    timeoutId = setTimeout(() => {
      process.kill('SIGTERM');
      reject(new Error('PDF to image conversion timed out'));
    }, timeout);
  });
}

async function createZipFile(filePaths: string[], outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = require('fs').createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
      console.log(`Zip file created: ${archive.pointer()} total bytes`);
      resolve();
    });
    
    archive.on('error', (err) => {
      reject(err);
    });
    
    archive.pipe(output);
    
    // Add files to archive
    for (const filePath of filePaths) {
      const fileName = path.basename(filePath);
      archive.file(filePath, { name: fileName });
    }
    
    archive.finalize();
  });
}

export async function checkPopplerAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const process = spawn('pdftoppm', ['-v'], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    process.on('close', (code) => {
      resolve(code === 0);
    });
    
    process.on('error', () => {
      resolve(false);
    });
  });
}
