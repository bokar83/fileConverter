import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { ConversionResult, FileWithPreview } from '../types';
import { convertFiles } from '../services/api';
import { FileList } from './FileList';
import { FormatSelector } from './FormatSelector';
import { ResultsList } from './ResultsList';

export const FileConverter: React.FC = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: FileWithPreview[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file),
      status: 'ready'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    setError('');
    
    // Auto-select format if only one file type
    if (newFiles.length > 0 && files.length === 0) {
      const firstFile = newFiles[0];
      const extension = firstFile.file.name.split('.').pop()?.toLowerCase();
      if (extension) {
        const availableFormats = getAvailableFormats(extension);
        if (availableFormats.length > 0) {
          setTargetFormat(availableFormats[0]);
        }
      }
    }
  }, [files.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/tiff': ['.tiff'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp'],
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/x-msvideo': ['.avi'],
      'video/x-matroska': ['.mkv'],
      'video/webm': ['.webm']
    },
    multiple: true
  });

  const handleConvert = async () => {
    if (files.length === 0 || !targetFormat) {
      setError('Please select files and target format');
      return;
    }

    setIsConverting(true);
    setError('');
    setResults([]);

    try {
      const fileList = files.map(f => f.file);
      const response = await convertFiles(fileList, targetFormat);
      
      if (response.success) {
        setResults(response.results);
        setFiles([]); // Clear files after successful conversion
      } else {
        setError(response.error || 'Conversion failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setIsConverting(false);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleClearResults = () => {
    setResults([]);
  };

  const getAvailableFormats = (inputFormat: string): string[] => {
    const videoFormats = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
    const formatMap: Record<string, string[]> = {
      'docx': ['pdf'],
      'xlsx': ['pdf'],
      'pptx': ['pdf'],
      'txt': ['pdf'],
      'pdf': ['png', 'jpeg'],
      'jpeg': ['png', 'webp', 'pdf'],
      'jpg': ['png', 'webp', 'pdf'],
      'png': ['jpeg', 'webp', 'tiff', 'pdf'],
      'webp': ['jpeg', 'png', 'pdf'],
      'tiff': ['png', 'pdf'],
      'gif': ['png', 'jpeg', 'pdf'],
      'bmp': ['png', 'jpeg', 'pdf']
    };
    if (videoFormats.includes(inputFormat)) {
      return videoFormats.filter(format => format !== inputFormat);
    }
    return formatMap[inputFormat] || [];
  };

  const getCommonFormats = (): string[] => {
    if (files.length === 0) return [];
    
    const allFormats = files.map(f => {
      const ext = f.file.name.split('.').pop()?.toLowerCase();
      return ext ? getAvailableFormats(ext) : [];
    });
    
    // Find intersection of all available formats
    return allFormats.reduce((acc, formats) => 
      acc.filter(format => formats.includes(format)), 
      allFormats[0] || []
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Upload Area */}
      <div className="card">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-primary-500 bg-primary-100' 
              : 'border-primary-300 hover:border-primary-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-primary-400 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-lg text-primary-600">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-lg text-primary-700 mb-2">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-primary-500">
                Supports DOCX, XLSX, PPTX, TXT, PDF, JPEG, PNG, WebP, TIFF, GIF, BMP, MP4, MOV, AVI, MKV, WebM
              </p>
            </div>
          )}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <FileList 
          files={files} 
          onRemove={handleRemoveFile}
        />
      )}

      {/* Format Selection */}
      {files.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">Select Output Format</h3>
          <FormatSelector
            availableFormats={getCommonFormats()}
            selectedFormat={targetFormat}
            onFormatChange={setTargetFormat}
          />
        </div>
      )}

      {/* Convert Button */}
      {files.length > 0 && targetFormat && (
        <div className="text-center">
          <button
            onClick={handleConvert}
            disabled={isConverting}
            className="btn-primary text-lg px-8 py-3"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                Convert Files
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <ResultsList 
          results={results} 
          onClear={handleClearResults}
        />
      )}
    </div>
  );
};



