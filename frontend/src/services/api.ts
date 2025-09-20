import { ConversionResponse, ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function convertFiles(files: File[], targetFormat: string): Promise<ConversionResponse> {
  const formData = new FormData();
  
  files.forEach(file => {
    formData.append('files', file);
  });
  formData.append('targetFormat', targetFormat);

  try {
    const response = await fetch(`${API_BASE_URL}/convert`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data: ConversionResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Conversion error:', error);
    throw error;
  }
}

export async function downloadFile(downloadUrl: string, filename: string): Promise<void> {
  try {
    const response = await fetch(downloadUrl);
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}



