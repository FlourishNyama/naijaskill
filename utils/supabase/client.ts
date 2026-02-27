import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true, // This keeps users logged in
        autoRefreshToken: true, // This fixes the "session expired" loop
        detectSessionInUrl: true // This helps the reset link work without breaking login
      }
    }
  )