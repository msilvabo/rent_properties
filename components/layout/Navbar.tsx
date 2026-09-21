'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/context';
import { useAuth } from '@/lib/auth/context';
import { LanguageSelector } from './LanguageSelector';

export const Navbar = () => {
  const { t } = useLanguage();
  const { user, avatarUrl, displayName, userEmail, signOut, isLoading, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('buy');
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  const navItems = [
    { id: 'buy', label: t('nav.buy') },
    { id: 'rent', label: t('nav.rent') },
    { id: 'sell', label: t('nav.sell') },
    { id: 'saved', label: t('nav.savedHomes') },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    await signOut();
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#EEF6F6]/95 backdrop-blur-md border-b border-[#19322F]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#19322F] group-hover:bg-[#006655] transition-colors flex items-center justify-center">
              <span className="material-icons text-white text-lg">apartment</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-[#19322F] group-hover:text-[#006655] transition-colors">
              LuxeEstate
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`font-medium text-sm px-1 py-1 transition-all cursor-pointer ${
                    isActive
                      ? 'text-[#006655] border-b-2 border-[#006655]'
                      : 'text-[#19322F]/70 hover:text-[#19322F] hover:border-b-2 hover:border-[#19322F]/20'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Action buttons, Language Selector & Profile */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Language Selector */}
            <LanguageSelector compact />

            <button
              aria-label={t('nav.searchAria')}
              className="text-[#19322F] hover:text-[#006655] transition-colors cursor-pointer"
            >
              <span className="material-icons">search</span>
            </button>

            <button
              aria-label={t('nav.notificationsAria')}
              className="text-[#19322F] hover:text-[#006655] transition-colors relative cursor-pointer"
            >
              <span className="material-icons">notifications_none</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[#EEF6F6]"></span>
            </button>

            {/* Profile / Auth Area */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#19322F]/10 ml-1">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#006655]/10 hover:bg-[#006655] text-[#006655] hover:text-white transition-all text-xs font-semibold border border-[#006655]/20 cursor-pointer"
                  title="Panel Administrativo"
                >
                  <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                  <span>Admin</span>
                </Link>
              )}

              {isLoading ? (
                <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
              ) : user ? (
                /* Authenticated: User Avatar with Dropdown */
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    aria-expanded={profileMenuOpen}
                    aria-haspopup="true"
                    aria-label={t('nav.profileAria')}
                    title={displayName}
                    className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-[#006655]/30 hover:ring-[#006655] focus:ring-[#006655] transition-all cursor-pointer bg-[#006655]/10 flex items-center justify-center text-[#006655] shadow-xs"
                  >
                    {avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        alt={displayName}
                        className="w-full h-full object-cover"
                        src={avatarUrl}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-sm font-bold uppercase">
                        {displayName ? displayName.charAt(0) : 'U'}
                      </span>
                    )}
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-[#19322F]/10 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right focus:outline-none"
                      role="menu"
                    >
                      <div className="px-3.5 py-2.5 border-b border-gray-100">
                        <p className="text-sm font-semibold text-[#19322F] truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-[#5C706D] truncate mt-0.5">
                          {userEmail}
                        </p>
                      </div>

                      <div className="py-1">
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setProfileMenuOpen(false)}
                            role="menuitem"
                            className="w-full text-left px-3.5 py-2 text-sm text-[#006655] hover:bg-[#006655]/10 flex items-center gap-2 transition-colors cursor-pointer font-semibold border-b border-gray-100"
                          >
                            <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                            <span>Panel de Control</span>
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          role="menuitem"
                          className="w-full text-left px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <span className="material-icons text-base">logout</span>
                          <span>{t('auth.signOut') || 'Cerrar sesión'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Unauthenticated: Sign In Button */
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#006655] hover:bg-[#004d40] text-white text-xs sm:text-sm font-medium transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                >
                  <span className="material-icons text-base">login</span>
                  <span>{t('auth.signIn') || 'Iniciar sesión'}</span>
                </Link>
              )}

              {/* Mobile menu hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden ml-1 p-1 text-[#19322F] hover:text-[#006655] transition-colors cursor-pointer"
                aria-label={t('nav.menuToggleAria')}
              >
                <span className="material-icons text-2xl">
                  {mobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div
        className={`md:hidden border-t border-[#19322F]/5 bg-[#EEF6F6] overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-96 py-3' : 'max-h-0 py-0'
        }`}
      >
        <div className="px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${
                  isActive
                    ? 'text-[#006655] bg-[#006655]/10 font-semibold'
                    : 'text-[#19322F] hover:bg-black/5'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* Mobile Auth Button */}
          <div className="pt-2 mt-2 border-t border-[#19322F]/10 space-y-2">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#006655]/10 text-[#006655] font-semibold text-sm border border-[#006655]/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                <span>Panel Administrativo</span>
              </Link>
            )}
            {user ? (
              <div className="flex items-center justify-between py-2 px-1">
                <div className="flex items-center gap-2 min-w-0">
                  {avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      alt={displayName}
                      className="w-8 h-8 rounded-full object-cover"
                      src={avatarUrl}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#006655]/10 flex items-center justify-center text-[#006655] font-bold text-xs">
                      {displayName.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#19322F] truncate">{displayName}</p>
                    <p className="text-xs text-[#5C706D] truncate">{userEmail}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1 cursor-pointer"
                >
                  {t('auth.signOut') || 'Salir'}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#006655] text-white text-sm font-medium text-center shadow-xs"
              >
                <span className="material-icons text-base">login</span>
                <span>{t('auth.signIn') || 'Iniciar sesión'}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

