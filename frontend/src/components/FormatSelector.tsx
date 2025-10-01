import React from 'react';

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
    pdf: 'PDF',
    png: 'PNG',
    jpeg: 'JPEG',
    jpg: 'JPEG',
    webp: 'WebP',
    tiff: 'TIFF'
  };

  if (availableFormats.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-primary-500">No common conversion formats available for selected files</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-primary-700" htmlFor="target-format">
        Choose output format
      </label>
      <div className="relative">
        <select
          id="target-format"
          value={selectedFormat || availableFormats[0]}
          onChange={(event) => onFormatChange(event.target.value)}
          className="w-full appearance-none rounded-lg border-2 border-primary-200 bg-white px-4 py-3 text-primary-700 focus:border-primary-500 focus:outline-none"
        >
          {availableFormats.map((format) => (
            <option key={format} value={format}>
              {formatLabels[format] || format.toUpperCase()}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-primary-400">
          ▾
        </span>
      </div>
    </div>
  );
};



