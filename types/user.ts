export type AppRole = 'admin' | 'agent' | 'user';

export interface UserRoleRecord {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole;
  created_at: string;
  updated_at: string;
}

export interface RoleOption {
  value: AppRole;
  label: string;
  description: string;
  color: string;
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    value: 'admin',
    label: 'Administrador',
    description: 'Acceso total al panel de administración y control de roles',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    value: 'agent',
    label: 'Agente Inmobiliario',
    description: 'Gestión de propiedades, asesoramiento y listings',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    value: 'user',
    label: 'Usuario Regular',
    description: 'Búsqueda, guardado de favoritos y contacto',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
  },
];
