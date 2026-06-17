import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof process !== 'undefined' && process.env.VITE_SUPABASE_URL) || (import.meta && import.meta.env && import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = (typeof process !== 'undefined' && process.env.VITE_SUPABASE_ANON_KEY) || (import.meta && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
    // This error will be caught during build time or runtime if env vars are missing
    console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(
    supabaseUrl || '', // Fallback to avoid crash during initial setup, but will error on use
    supabaseAnonKey || ''
);
