export interface FileWithPreview {
  file: File;
  id: string;
  preview: string;
  status: 'ready' | 'converting' | 'completed' | 'error';
}

export interface ConversionResult {
  id: string;
  originalName: string;
  convertedName: string;
  downloadUrl: string;
  size?: number;
  error?: string;
}

export interface ConversionResponse {
  success: boolean;
  results: ConversionResult[];
  message?: string;
  error?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: string[];
}



