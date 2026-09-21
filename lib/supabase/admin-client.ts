import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

/**
 * Creates an authenticated Supabase client for use in API routes.
 *
 * Strategy when a Bearer token is present:
 * 1. Verify the token via auth.getUser(token) to get the user.
 * 2. Create a new supabase-js client that injects the token into every
 *    Supabase REST request via global.headers. This ensures RLS policies
 *    can resolve auth.uid() correctly without needing a refresh token.
 *
 * When no Bearer token is present, falls back to the cookie-based SSR
 * client (suitable for server-side calls within Next.js middleware/RSC).
 */
export async function getAdminSupabaseClient(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : undefined;

  if (bearerToken) {
    // Create a client that sends the JWT on every request so RLS works.
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        },
        auth: { persistSession: false, autoRefreshToken: false },
      }
    );

    // Verify the token and retrieve the user (validates JWT signature).
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(bearerToken);

    return { supabase, user, authError };
  }

  // Fallback: cookie-based SSR client (no Bearer token present)
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  return { supabase, user, authError };
}
