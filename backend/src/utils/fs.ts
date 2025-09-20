import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

export async function generateUniqueFilename(originalName: string, extension?: string): Promise<string> {
  const uuid = uuidv4();
  const ext = extension || path.extname(originalName);
  return `${uuid}${ext}`;
}

export async function writeFile(filePath: string, data: Buffer): Promise<void> {
  await fs.writeFile(filePath, data);
}

export async function readFile(filePath: string): Promise<Buffer> {
  return await fs.readFile(filePath);
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.warn(`Failed to delete file ${filePath}:`, error);
  }
}

export async function deleteDirectory(dirPath: string): Promise<void> {
  try {
    await fs.rmdir(dirPath, { recursive: true });
  } catch (error) {
    console.warn(`Failed to delete directory ${dirPath}:`, error);
  }
}

export async function getFileStats(filePath: string): Promise<{ size: number; mtime: Date }> {
  const stats = await fs.stat(filePath);
  return {
    size: stats.size,
    mtime: stats.mtime
  };
}

export async function listFilesInDirectory(dirPath: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dirPath);
    return files;
  } catch {
    return [];
  }
}

export async function cleanupOldFiles(dirPath: string, maxAgeMinutes: number): Promise<number> {
  let deletedCount = 0;
  const now = Date.now();
  const maxAgeMs = maxAgeMinutes * 60 * 1000;
  
  try {
    const files = await fs.readdir(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAgeMs) {
        await fs.unlink(filePath);
        deletedCount++;
      }
    }
  } catch (error) {
    console.warn(`Failed to cleanup old files in ${dirPath}:`, error);
  }
  
  return deletedCount;
}



