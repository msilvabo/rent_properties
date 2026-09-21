'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';

export function AdminUserHeaderMenu() {
  const router = useRouter();
  const { user, avatarUrl, displayName, userEmail, signOut, isLoading, role } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    router.push('/login');
  };

  if (isLoading) {
    return <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* User Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        aria-expanded={menuOpen}
        aria-haspopup="true"
        title={displayName}
        className="flex items-center gap-2.5 p-1 sm:pr-2.5 rounded-full hover:bg-black/5 focus:outline-none transition-all cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-[#006655]/30 group-hover:ring-[#006655] transition-all bg-[#006655]/10 flex items-center justify-center text-[#006655] shadow-xs">
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
              {displayName ? displayName.charAt(0) : 'A'}
            </span>
          )}
        </div>

        {/* User Display Name & Chevron (Desktop) */}
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold text-[#19322F] max-w-[130px] truncate leading-tight">
            {displayName}
          </span>
          <span className="text-2xs text-[#006655] font-medium capitalize leading-tight">
            {role || 'Admin'}
          </span>
        </div>

        <span className="material-symbols-outlined text-base text-[#5C706D] group-hover:text-[#19322F] transition-transform duration-200">
          {menuOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div
          className="absolute right-0 mt-2 w-60 rounded-2xl bg-white shadow-xl border border-[#19322F]/10 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right focus:outline-none"
          role="menu"
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-2xs font-bold uppercase tracking-wider text-emerald-700">
                Sesión Activa
              </span>
            </div>
            <p className="text-sm font-bold text-[#19322F] truncate">
              {displayName}
            </p>
            <p className="text-xs text-[#5C706D] truncate mt-0.5 font-mono">
              {userEmail}
            </p>
          </div>

          {/* Actions */}
          <div className="py-1 px-1.5">
            <button
              onClick={handleSignOut}
              role="menuitem"
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
