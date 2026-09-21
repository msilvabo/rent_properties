'use client';

import { useState } from 'react';
import { Property } from '@/types/property';
import { UserRoleRecord } from '@/types/user';
import { AdminPropertiesView } from './AdminPropertiesView';
import { AdminUsersView } from './AdminUsersView';

interface AdminDashboardClientProps {
  initialProperties: Property[];
  initialUsers: UserRoleRecord[];
}

export function AdminDashboardClient({
  initialProperties,
  initialUsers,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'properties' | 'users'>('properties');

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#19322F]/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#006655]">
              Administración Central
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#19322F] tracking-tight">
            Panel de Control
          </h1>
          <p className="text-sm text-[#5C706D] mt-1">
            Monitoreo en tiempo real de propiedades activas y gestión de privilegios de usuario.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-2xl bg-white p-1.5 border border-[#19322F]/10 shadow-xs">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'properties'
                ? 'bg-[#006655] text-white shadow-xs'
                : 'text-[#5C706D] hover:text-[#19322F] hover:bg-[#EEF6F6]'
            }`}
          >
            <span className="material-symbols-outlined text-lg">apartment</span>
            <span>Propiedades Actuales</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-2xs ${
                activeTab === 'properties'
                  ? 'bg-white/20 text-white'
                  : 'bg-black/5 text-[#5C706D]'
              }`}
            >
              {initialProperties.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#006655] text-white shadow-xs'
                : 'text-[#5C706D] hover:text-[#19322F] hover:bg-[#EEF6F6]'
            }`}
          >
            <span className="material-symbols-outlined text-lg">manage_accounts</span>
            <span>Usuarios &amp; Roles</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-2xs ${
                activeTab === 'users'
                  ? 'bg-white/20 text-white'
                  : 'bg-black/5 text-[#5C706D]'
              }`}
            >
              {initialUsers.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'properties' ? (
        <AdminPropertiesView initialProperties={initialProperties} />
      ) : (
        <AdminUsersView initialUsers={initialUsers} />
      )}
    </div>
  );
}
