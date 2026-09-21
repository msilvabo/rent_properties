'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { UserRoleRecord, AppRole, ROLE_OPTIONS } from '@/types/user';
import { useAuth } from '@/lib/auth/context';

interface AdminUsersViewProps {
  initialUsers?: UserRoleRecord[];
}

export function AdminUsersView({ initialUsers = [] }: AdminUsersViewProps) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserRoleRecord[]>(initialUsers);
  const [isLoading, setIsLoading] = useState<boolean>(initialUsers.length === 0);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        throw new Error('Error al cargar la lista de usuarios');
      }
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setFeedbackMessage({ type: 'error', text: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialUsers.length === 0) {
      fetchUsers();
    }
  }, [fetchUsers, initialUsers.length]);

  // Handle role change
  const handleRoleChange = async (targetUser: UserRoleRecord, newRole: AppRole) => {
    if (targetUser.role === newRole) return;

    // Caution if self-demoting
    if (
      targetUser.user_id === currentUser?.id &&
      newRole !== 'admin' &&
      !window.confirm(
        '⚠️ Atención: Te estás retirando los permisos de administrador. Si continúas, perderás el acceso a este panel. ¿Estás seguro?'
      )
    ) {
      return;
    }

    setUpdatingUserId(targetUser.user_id);
    setFeedbackMessage(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUser.user_id,
          role: newRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo actualizar el rol');
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === targetUser.user_id ? { ...u, role: newRole } : u
        )
      );

      const roleObj = ROLE_OPTIONS.find((r) => r.value === newRole);
      setFeedbackMessage({
        type: 'success',
        text: `El rol de ${targetUser.email} se actualizó a "${roleObj?.label || newRole}" con éxito.`,
      });

      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        setFeedbackMessage((current) => (current?.type === 'success' ? null : current));
      }, 5000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar rol';
      setFeedbackMessage({ type: 'error', text: message });
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === 'admin').length;
    const agents = users.filter((u) => u.role === 'agent').length;
    const standardUsers = users.filter((u) => u.role === 'user').length;
    return { total, admins, agents, standardUsers };
  }, [users]);

  // Filtering
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !searchTerm.trim() ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#19322F]/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5C706D]">
              Total Usuarios
            </span>
            <span className="w-8 h-8 rounded-lg bg-[#006655]/10 text-[#006655] flex items-center justify-center">
              <span className="material-symbols-outlined text-base">group</span>
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#19322F] mt-2">
            {stats.total}
          </p>
          <span className="text-xs text-[#5C706D] mt-1 inline-block">
            Cuentas sincronizadas
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#19322F]/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5C706D]">
              Administradores
            </span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">admin_panel_settings</span>
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#19322F] mt-2">
            {stats.admins}
          </p>
          <span className="text-xs text-[#5C706D] mt-1 inline-block">
            Acceso total al sistema
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#19322F]/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5C706D]">
              Agentes
            </span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">badge</span>
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#19322F] mt-2">
            {stats.agents}
          </p>
          <span className="text-xs text-[#5C706D] mt-1 inline-block">
            Gestores inmobiliarios
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#19322F]/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5C706D]">
              Usuarios Regulares
            </span>
            <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">person</span>
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#19322F] mt-2">
            {stats.standardUsers}
          </p>
          <span className="text-xs text-[#5C706D] mt-1 inline-block">
            Clientes y compradores
          </span>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between transition-all animate-in fade-in slide-in-from-top-2 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-xl">
              {feedbackMessage.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <p className="text-sm font-medium">{feedbackMessage.text}</p>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-500 hover:text-slate-800 p-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#19322F]/10 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C706D] text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por correo o nombre de usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#EEF6F6]/60 border border-[#19322F]/10 text-sm text-[#19322F] placeholder-[#5C706D] focus:outline-none focus:ring-2 focus:ring-[#006655]/30 focus:border-[#006655] transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5C706D] hover:text-[#19322F]"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>

        {/* Filter Controls & Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-2.5 px-3 rounded-xl bg-[#EEF6F6]/60 border border-[#19322F]/10 text-xs sm:text-sm text-[#19322F] focus:outline-none focus:ring-2 focus:ring-[#006655]/30 cursor-pointer"
          >
            <option value="all">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="agent">Agentes</option>
            <option value="user">Usuarios regulares</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#EEF6F6] hover:bg-[#EEF6F6]/80 text-[#19322F] text-xs sm:text-sm font-medium border border-[#19322F]/10 transition-colors disabled:opacity-50 cursor-pointer"
            title="Recargar usuarios"
          >
            <span
              className={`material-symbols-outlined text-base ${
                isLoading ? 'animate-spin' : ''
              }`}
            >
              refresh
            </span>
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#19322F]/10 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 border-4 border-[#006655] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-[#5C706D]">Cargando usuarios desde Supabase...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <span className="material-symbols-outlined text-2xl">person_off</span>
            </div>
            <h3 className="text-base font-bold text-[#19322F]">
              No se encontraron usuarios
            </h3>
            <p className="text-xs text-[#5C706D] mt-1">
              No hay usuarios que coincidan con la búsqueda o filtro aplicado.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#EEF6F6]/50 border-b border-[#19322F]/10 text-xs font-semibold text-[#5C706D] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Correo Electrónico</th>
                  <th className="py-3 px-4">Registro</th>
                  <th className="py-3 px-4">Rol Actual</th>
                  <th className="py-3 px-4">Modificar Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => {
                  const isUpdating = updatingUserId === u.user_id;
                  const isCurrentLoggedUser = currentUser?.id === u.user_id;

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCurrentLoggedUser ? 'bg-[#006655]/5' : ''
                      }`}
                    >
                      {/* Avatar & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-black/5 flex items-center justify-center">
                            {u.avatar_url ? (
                              <Image
                                src={u.avatar_url}
                                alt={u.full_name || u.email}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="font-bold text-sm text-[#006655] uppercase">
                                {(u.full_name || u.email).charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[#19322F] flex items-center gap-1.5">
                              <span>{u.full_name || 'Sin nombre registrado'}</span>
                              {isCurrentLoggedUser && (
                                <span className="text-2xs font-semibold bg-[#006655] text-white px-2 py-0.5 rounded-full">
                                  Tú
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-[#5C706D] font-mono">
                              ID: {u.user_id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-xs font-medium text-[#19322F]">
                        {u.email}
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 text-xs text-[#5C706D] whitespace-nowrap">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </td>

                      {/* Current Role Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            u.role === 'admin'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : u.role === 'agent'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xs">
                            {u.role === 'admin'
                              ? 'admin_panel_settings'
                              : u.role === 'agent'
                              ? 'badge'
                              : 'person'}
                          </span>
                          <span className="capitalize">{u.role}</span>
                        </span>
                      </td>

                      {/* Role Selector */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={u.role}
                            disabled={isUpdating}
                            onChange={(e) =>
                              handleRoleChange(u, e.target.value as AppRole)
                            }
                            className="py-1.5 px-3 rounded-lg bg-white border border-[#19322F]/20 text-xs font-medium text-[#19322F] focus:outline-none focus:ring-2 focus:ring-[#006655]/30 cursor-pointer disabled:opacity-50"
                          >
                            {ROLE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>

                          {isUpdating && (
                            <div className="w-4 h-4 border-2 border-[#006655] border-t-transparent rounded-full animate-spin shrink-0"></div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
