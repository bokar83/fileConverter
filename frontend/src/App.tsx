import React, { useEffect, useState } from 'react';
import { FileConverter } from './components/FileConverter';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
      }

      if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }

    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="min-h-screen bg-primary-50 text-primary-900 transition-colors duration-200 dark:bg-neutral-950 dark:text-neutral-100">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main className="container mx-auto px-4 py-8">
        <FileConverter />
      </main>
      <Footer />
    </div>
  );
}

export default App;



