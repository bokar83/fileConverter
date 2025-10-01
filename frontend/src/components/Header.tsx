import React from 'react';
import { FileText, Moon, Sun } from 'lucide-react';

type HeaderProps = {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
};

export const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme }) => {
  const isDark = theme === 'dark';

  return (
    <header className="header-gradient shadow-lg border-b border-primary-700 dark:border-neutral-800">
      <div className="container mx-auto px-4 py-6 relative">
        <button
          type="button"
          onClick={onToggleTheme}
          className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-14 h-14 bg-accent-500 rounded-xl shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div className="text-center text-white">
              <h1 className="text-3xl font-bold">File Converter</h1>
              <p className="text-accent-200 text-sm font-medium">by Catalyst Works</p>
              <p className="text-primary-200 text-xs">Fast & Simple File Conversion</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};



