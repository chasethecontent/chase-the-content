
import { createClient } from '@supabase/supabase-js';

/**
 * Robust environment variable retrieval for Vite/Vercel/Production.
 */
const getEnv = (key: string): string => {
  const viteKey = `VITE_${key}`;
  try {
    // Check various common env locations
    return (
      (import.meta as any).env?.[viteKey] || 
      (window as any).process?.env?.[viteKey] || 
      (window as any).process?.env?.[key] || 
      ''
    );
  } catch (e) {
    return '';
  }
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

// Initialize with a fallback to prevent total app failure if keys are missing
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

/**
 * Validates if the app is connected to a real backend
 */
export const isSupabaseConfigured = () => {
  return (
    !!supabaseUrl && 
    supabaseUrl.includes('supabase.co') &&
    !!supabaseAnonKey &&
    supabaseAnonKey !== 'placeholder-key'
  );
};
