import { cleanupOldFiles } from '../utils/fs';

export class CleanupService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly tmpDir: string;
  private readonly maxAgeMinutes: number;

  constructor(tmpDir: string, maxAgeMinutes: number = 30) {
    this.tmpDir = tmpDir;
    this.maxAgeMinutes = maxAgeMinutes;
  }

  start(): void {
    if (this.intervalId) {
      return; // Already running
    }

    console.log(`Starting cleanup service (every 10 minutes, max age: ${this.maxAgeMinutes} minutes)`);
    
    // Run cleanup immediately
    this.runCleanup();
    
    // Then run every 10 minutes
    this.intervalId = setInterval(() => {
      this.runCleanup();
    }, 10 * 60 * 1000); // 10 minutes
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Cleanup service stopped');
    }
  }

  private async runCleanup(): Promise<void> {
    try {
      const deletedCount = await cleanupOldFiles(this.tmpDir, this.maxAgeMinutes);
      if (deletedCount > 0) {
        console.log(`Cleanup: Deleted ${deletedCount} old files from ${this.tmpDir}`);
      }
    } catch (error) {
      console.error('Cleanup service error:', error);
    }
  }
}

// Create singleton instance
export const cleanupService = new CleanupService(
  process.env.TMP_DIR || 'tmp',
  parseInt(process.env.CLEANUP_MAX_AGE_MINUTES || '30')
);
