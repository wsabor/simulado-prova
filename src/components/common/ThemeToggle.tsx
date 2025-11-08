'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const options = [
    { value: 'light' as const, label: 'Claro', icon: '☀️' },
    { value: 'dark' as const, label: 'Escuro', icon: '🌙' },
    { value: 'system' as const, label: 'Sistema', icon: '💻' }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Alterar tema"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {theme === 'light' && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          )}
          {theme === 'dark' && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          )}
          {theme === 'system' && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          )}
        </svg>
      </button>

      {showMenu && (
        <>
          {/* Overlay para fechar o menu ao clicar fora */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setShowMenu(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-3 ${
                  theme === option.value
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{option.icon}</span>
                <span>{option.label}</span>
                {theme === option.value && (
                  <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
