import React from 'react';
import { FileText, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="header-gradient shadow-lg border-b border-primary-700">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-14 h-14 bg-accent-500 rounded-xl shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white">File Converter</h1>
              <p className="text-accent-200 text-sm font-medium">by Catalyst Works</p>
              <p className="text-primary-200 text-xs">Fast & Simple File Conversion</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};



