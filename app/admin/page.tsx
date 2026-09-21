import { getAllAdminProperties } from '@/lib/properties';
import { createClient } from '@/lib/supabase/server';
import { UserRoleRecord } from '@/types/user';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // Fetch properties (with mock fallback if DB error)
  const properties = await getAllAdminProperties();

  // Fetch users from user_roles
  let users: UserRoleRecord[] = [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      users = data as UserRoleRecord[];
    }
  } catch (err) {
    console.error('[AdminPage] Error loading initial user roles:', err);
  }

  return (
    <AdminDashboardClient
      initialProperties={properties}
      initialUsers={users}
    />
  );
}
