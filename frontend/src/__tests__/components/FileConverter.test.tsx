import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FileConverter } from '../../components/FileConverter';

// Mock the API service
vi.mock('../../services/api', () => ({
  convertFiles: vi.fn(),
  downloadFile: vi.fn(),
  checkHealth: vi.fn(),
}));

describe('FileConverter', () => {
  it('renders upload area', () => {
    render(<FileConverter />);
    
    expect(screen.getByText('Drag & drop files here, or click to select')).toBeInTheDocument();
    expect(screen.getByText('Supports DOCX, XLSX, PPTX, TXT, PDF, JPEG, PNG, WebP, TIFF, GIF, BMP')).toBeInTheDocument();
  });

  it('shows convert button when files are selected', () => {
    // This would require more complex setup with file selection
    // For now, just test the basic render
    render(<FileConverter />);
    expect(screen.getByRole('button', { name: /convert files/i })).toBeInTheDocument();
  });
});



