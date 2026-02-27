import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    // Added the "!" at the end of these two lines
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true, // Crucial for keeping users logged in
        detectSessionInUrl: true, // Crucial for the password reset link
      },
    }
  )