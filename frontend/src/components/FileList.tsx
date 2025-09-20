import React from 'react';
import { X, FileText, Image } from 'lucide-react';
import { FileWithPreview } from '../types';

interface FileListProps {
  files: FileWithPreview[];
  onRemove: (id: string) => void;
}

export const FileList: React.FC<FileListProps> = ({ files, onRemove }) => {
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Selected Files ({files.length})
      </h3>
      <div className="space-y-2">
        {files.map((fileWithPreview) => (
          <div
            key={fileWithPreview.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              {getFileIcon(fileWithPreview.file)}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {fileWithPreview.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(fileWithPreview.file.size)}
                </p>
              </div>
            </div>
            <button
              onClick={() => onRemove(fileWithPreview.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};



