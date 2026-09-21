import React from 'react';
import Link from 'next/link';
import { AdminUserHeaderMenu } from '@/components/admin/AdminUserHeaderMenu';

export const metadata = {
  title: 'Panel Administrativo — LuxeEstate',
  description: 'Gestión de propiedades y control de roles de usuarios',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#EEF6F6] text-[#19322F] flex flex-col font-display selection:bg-[#006655] selection:text-white">
      {/* Admin Top Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#19322F]/10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo + Admin Badge */}
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="flex items-center gap-2 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#006655] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold tracking-tight text-[#19322F]">
                    LuxeEstate
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#006655]/10 text-[#006655] border border-[#006655]/20">
                    Admin
                  </span>
                </div>
              </Link>
            </div>

            {/* Right Header Area: Back to site & User Menu */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-[#5C706D] hover:text-[#19322F] hover:bg-black/5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">storefront</span>
                <span className="hidden sm:inline">Ver Portal Público</span>
              </Link>

              <div className="h-6 w-px bg-[#19322F]/10" />

              {/* User profile with dropdown & sign out */}
              <AdminUserHeaderMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </div>

      {/* Admin Footer */}
      <footer className="border-t border-[#19322F]/10 bg-white/50 py-4 text-center text-xs text-[#5C706D]">
        <div className="max-w-7xl mx-auto px-4">
          LuxeEstate Admin Console &bull; Gestión Segura con Supabase Auth &amp; PostgreSQL RLS
        </div>
      </footer>
    </div>
  );
}
