// In-memory storage for conversion results
// In production, use Redis or a database

export interface ConversionResult {
  filePath: string;
  originalName: string;
  convertedName: string;
  mimeType: string;
  createdAt: Date;
}

class StorageService {
  private results = new Map<string, ConversionResult>();

  set(id: string, result: ConversionResult): void {
    this.results.set(id, result);
  }

  get(id: string): ConversionResult | undefined {
    return this.results.get(id);
  }

  delete(id: string): boolean {
    return this.results.delete(id);
  }

  has(id: string): boolean {
    return this.results.has(id);
  }

  clear(): void {
    this.results.clear();
  }

  size(): number {
    return this.results.size;
  }
}

export const storageService = new StorageService();



