import React from 'react';
import { Download, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { ConversionResult } from '../types';
import { downloadFile } from '../services/api';

interface ResultsListProps {
  results: ConversionResult[];
  onClear: () => void;
}

export const ResultsList: React.FC<ResultsListProps> = ({ results, onClear }) => {
  const handleDownload = async (result: ConversionResult) => {
    try {
      await downloadFile(result.downloadUrl, result.convertedName);
    } catch (error) {
      console.error('Download failed:', error);
      // You could add a toast notification here
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const successfulResults = results.filter(r => !r.error);
  const failedResults = results.filter(r => r.error);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Conversion Results ({successfulResults.length} successful, {failedResults.length} failed)
        </h3>
        <button
          onClick={onClear}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Successful conversions */}
        {successfulResults.map((result) => (
          <div
            key={result.id}
            className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {result.originalName} → {result.convertedName}
                </p>
                {result.size && (
                  <p className="text-xs text-gray-500">
                    {formatFileSize(result.size)}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleDownload(result)}
              className="btn-primary text-sm py-2 px-3"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </button>
          </div>
        ))}

        {/* Failed conversions */}
        {failedResults.map((result) => (
          <div
            key={result.id}
            className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {result.originalName}
                </p>
                <p className="text-xs text-red-600">
                  {result.error}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {successfulResults.length > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              // Download all successful results
              successfulResults.forEach(result => {
                handleDownload(result);
              });
            }}
            className="btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Download All
          </button>
        </div>
      )}
    </div>
  );
};



