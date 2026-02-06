
import { createClient } from '@supabase/supabase-js';

// Vercel and most modern hosts inject these into the environment.
// For local testing, you can temporarily hardcode them, but for production, 
// they MUST be set in the Vercel Dashboard.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);

/**
 * Robust check to see if we are in "Demo Mode" or "Live Mode"
 */
export const isSupabaseConfigured = () => {
  return (
    supabaseUrl !== '' && 
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey !== '' && 
    supabaseAnonKey !== 'placeholder'
  );
};
