import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { AppRole } from '@/types/user';

function getSupabaseServerClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {
        // Read-only in route handler without response cookies mutation
      },
    },
  });
}

// GET: List all users from user_roles (Admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient(request);

    // 1. Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // 2. Verify admin role
    const { data: callerRole, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleCheckError || callerRole?.role !== 'admin') {
      return NextResponse.json({ error: 'Permiso denegado. Se requiere rol admin.' }, { status: 403 });
    }

    // 3. Fetch all user roles
    const { data: users, error: fetchError } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json({ users });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH: Update a user's role (Admin only)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient(request);

    // 1. Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // 2. Verify admin role
    const { data: callerRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (callerRole?.role !== 'admin') {
      return NextResponse.json({ error: 'Permiso denegado. Se requiere rol admin.' }, { status: 403 });
    }

    // 3. Read body
    const body = await request.json();
    const { userId, role } = body as { userId: string; role: AppRole };

    if (!userId || !role) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos (userId, role)' }, { status: 400 });
    }

    const validRoles: AppRole[] = ['admin', 'agent', 'user'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Rol inválido. Debe ser admin, agent o user.' }, { status: 400 });
    }

    // 4. Update the role
    const { data: updated, error: updateError } = await supabase
      .from('user_roles')
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: updated,
      message: `Rol actualizado a "${role}" correctamente`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
