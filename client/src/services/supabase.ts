import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { envConfig } from '../config/env.js';

/**
 * MedSathi Supabase Foundation Service
 *
 * Establishes the official Supabase client for:
 * - Supabase Auth (Caregiver registration, login, session persistence)
 * - PostgreSQL Database with Row Level Security (RLS)
 * - Caregiver profile record management
 */

const supabaseUrl = envConfig.supabase.url || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = envConfig.supabase.anonKey || 'placeholder-anon-key';

if (!envConfig.isSupabaseConfigured && !envConfig.isProduction) {
  console.info(
    '[MedSathi Supabase] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not configured. ' +
    'To connect live authentication and PostgreSQL, populate them in your client .env file.'
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const getSupabase = (): SupabaseClient => supabase;

export default supabase;
