'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { FlagIcon } from './FlagIcon';

interface LanguageSelectorProps {
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  const { locale, setLocale, supportedLocales, currentLocaleMeta } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code: string) => {
    setLocale(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Idioma: ${currentLocaleMeta.name}`}
        title={currentLocaleMeta.name}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#19322F]/15 bg-white/80 hover:bg-white hover:border-[#006655] transition-all cursor-pointer shadow-2xs ${
          isOpen ? 'ring-2 ring-[#006655]/20 border-[#006655]' : ''
        }`}
      >
        <FlagIcon code={locale} className="w-5 h-3.5" />
        <span className="text-xs font-semibold tracking-wide uppercase text-[#19322F]">
          {currentLocaleMeta.short}
        </span>
        <span
          className={`material-icons text-sm text-[#5C706D] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          expand_more
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white shadow-lg border border-[#19322F]/10 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right focus:outline-none"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5C706D]/80 border-b border-gray-100 mb-1">
            Language / Idioma
          </div>
          {supportedLocales.map((item) => {
            const isSelected = item.code === locale;
            return (
              <button
                key={item.code}
                onClick={() => handleSelect(item.code)}
                role="menuitem"
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#006655]/10 text-[#006655] font-semibold'
                    : 'text-[#19322F] hover:bg-black/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FlagIcon code={item.code} className="w-5 h-3.5" />
                  <span className="text-xs font-bold uppercase text-[#5C706D]">
                    {item.short}
                  </span>
                  <span>{item.name}</span>
                </div>
                {isSelected && (
                  <span className="material-icons text-sm text-[#006655]">check</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
