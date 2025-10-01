import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-primary-800 border-t border-primary-700 mt-16 dark:bg-neutral-950 dark:border-neutral-800">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-primary-200 dark:text-neutral-300">
          <p>&copy; 2025 Catalyst Works. Convert documents and images with ease.</p>
          <p className="mt-1 text-primary-300 dark:text-neutral-400">Supports DOCX, XLSX, PPTX, TXT, PDF, JPEG, PNG, WebP, TIFF, GIF, BMP</p>
        </div>
      </div>
    </footer>
  );
};



