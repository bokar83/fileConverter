import React from 'react';
import { Check } from 'lucide-react';

interface FormatSelectorProps {
  availableFormats: string[];
  selectedFormat: string;
  onFormatChange: (format: string) => void;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  availableFormats,
  selectedFormat,
  onFormatChange
}) => {
  const formatLabels: Record<string, string> = {
    'pdf': 'PDF',
    'png': 'PNG',
    'jpeg': 'JPEG',
    'jpg': 'JPEG',
    'webp': 'WebP',
    'tiff': 'TIFF'
  };

  if (availableFormats.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No common conversion formats available for selected files</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {availableFormats.map((format) => (
        <button
          key={format}
          onClick={() => onFormatChange(format)}
          className={`relative p-4 border-2 rounded-lg text-center transition-all ${
            selectedFormat === format
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-200 hover:border-gray-300 text-gray-700'
          }`}
        >
          {selectedFormat === format && (
            <div className="absolute top-2 right-2">
              <Check className="w-4 h-4 text-primary-600" />
            </div>
          )}
          <div className="font-medium">
            {formatLabels[format] || format.toUpperCase()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            .{format}
          </div>
        </button>
      ))}
    </div>
  );
};



