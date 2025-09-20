import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-gray-600">
          <p>&copy; 2024 SnapConvert. Convert documents and images with ease.</p>
          <p className="mt-1">Supports DOCX, XLSX, PPTX, TXT, PDF, JPEG, PNG, WebP, TIFF, GIF, BMP</p>
        </div>
      </div>
    </footer>
  );
};



