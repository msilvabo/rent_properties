import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// createBrowserClient from @supabase/ssr ensures auth session is saved in cookies
// so Next.js middleware and Server Components can seamlessly read it.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
