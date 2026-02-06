
import { createClient } from '@supabase/supabase-js';

/**
 * Robust environment variable retrieval for Vite/Vercel.
 * Prevents "process is not defined" reference errors.
 */
const getEnv = (key: string): string => {
  try {
    // 1. Try Vite-specific import.meta.env
    const viteKey = `VITE_${key}`;
    const metaValue = (import.meta as any).env?.[viteKey];
    if (metaValue) return metaValue;

    // 2. Try window.process (some environments polyfill this)
    const proc = (window as any).process;
    if (proc?.env?.[viteKey]) return proc.env[viteKey];
    if (proc?.env?.[key]) return proc.env[key];

    return '';
  } catch (e) {
    return '';
  }
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

// We initialize with placeholder values if missing to prevent the client from crashing on boot.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

/**
 * Check to see if we are in "Demo Mode" or "Live Mode"
 */
export const isSupabaseConfigured = () => {
  return (
    supabaseUrl !== '' && 
    supabaseUrl.includes('supabase.co') &&
    supabaseAnonKey !== '' &&
    supabaseAnonKey !== 'placeholder-key'
  );
};
