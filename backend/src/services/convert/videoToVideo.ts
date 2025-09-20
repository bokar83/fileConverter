import path from 'path';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

import { deleteFile, ensureDirectoryExists } from '../../utils/fs';

export async function convertVideoToFormat(
  buffer: Buffer,
  inputExtension: string,
  targetFormat: string,
  outputDir: string
): Promise<string> {
  await ensureDirectoryExists(outputDir);

  const inputFilename = `${uuidv4()}.${inputExtension}`;
  const outputFilename = `${uuidv4()}.${targetFormat}`;

  const inputPath = path.join(outputDir, inputFilename);
  const outputPath = path.join(outputDir, outputFilename);

  await fs.writeFile(inputPath, buffer);

  const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';

  try {
    await new Promise<void>((resolve, reject) => {
      const args = ['-y', '-i', inputPath, outputPath];
      const ffmpegProcess = spawn(ffmpegPath, args);

      let stderrOutput = '';

      ffmpegProcess.stderr.on('data', (data: Buffer) => {
        stderrOutput += data.toString();
      });

      ffmpegProcess.on('error', (error) => {
        reject(error);
      });

      ffmpegProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}: ${stderrOutput}`));
        }
      });
    });
  } catch (error) {
    await deleteFile(inputPath);
    await deleteFile(outputPath).catch(() => undefined);

    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
      throw new Error('FFmpeg binary not found. Please install FFmpeg or set FFMPEG_PATH environment variable.');
    }

    throw error;
  }

  await deleteFile(inputPath);

  return outputPath;
}

