import { createClient } from '@supabase/supabase-js';

/**
 * Supabase admin client — uses the service role key.
 * Bypasses Row Level Security. Only use server-side (API routes, server actions).
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
