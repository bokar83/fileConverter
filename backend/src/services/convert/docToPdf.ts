import { spawn } from 'child_process';
import path from 'path';
import { ensureDirectoryExists, generateUniqueFilename, fileExists } from '../../utils/fs';

export interface DocToPdfOptions {
  timeout?: number;
}

export async function convertDocToPdf(
  inputBuffer: Buffer,
  inputFormat: string,
  outputDir: string,
  options: DocToPdfOptions = {}
): Promise<string> {
  await ensureDirectoryExists(outputDir);
  
  const inputFilename = await generateUniqueFilename('input', `.${inputFormat}`);
  const inputPath = path.join(outputDir, inputFilename);
  const outputFilename = await generateUniqueFilename('converted', '.pdf');
  const outputPath = path.join(outputDir, outputFilename);
  
  // Write input file
  const fs = require('fs');
  fs.writeFileSync(inputPath, inputBuffer);
  
  return new Promise((resolve, reject) => {
    const timeout = options.timeout || 30000; // 30 seconds default
    let timeoutId: NodeJS.Timeout;
    
    // LibreOffice command
    const command = 'soffice';
    const args = [
      '--headless',
      '--convert-to', 'pdf',
      '--outdir', outputDir,
      inputPath
    ];
    
    console.log(`Running LibreOffice: ${command} ${args.join(' ')}`);
    
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
        console.error('LibreOffice stderr:', stderr);
        reject(new Error(`LibreOffice conversion failed with code ${code}: ${stderr}`));
        return;
      }
      
      // Check if output file exists
      const expectedOutputPath = path.join(outputDir, path.basename(inputPath, `.${inputFormat}`) + '.pdf');
      
      if (await fileExists(expectedOutputPath)) {
        // Rename to our expected output filename
        try {
          fs.renameSync(expectedOutputPath, outputPath);
          resolve(outputPath);
        } catch (error) {
          reject(new Error(`Failed to rename output file: ${error}`));
        }
      } else {
        reject(new Error('LibreOffice did not produce expected output file'));
      }
    });
    
    process.on('error', (error) => {
      clearTimeout(timeoutId);
      reject(new Error(`Failed to start LibreOffice: ${error.message}`));
    });
    
    // Set timeout
    timeoutId = setTimeout(() => {
      process.kill('SIGTERM');
      reject(new Error('LibreOffice conversion timed out'));
    }, timeout);
  });
}

export async function checkLibreOfficeAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const process = spawn('soffice', ['--version'], {
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
