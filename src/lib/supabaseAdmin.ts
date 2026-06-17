import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof process !== 'undefined' && process.env.VITE_SUPABASE_URL) || (import.meta && import.meta.env && import.meta.env.VITE_SUPABASE_URL);

// Intentar usar la Service Role Key para saltar RLS en procesos backend.
// Si no existe, usamos la Anon Key (aunque fallará al procesar PVP por culpa de RLS).
const supabaseKey = (typeof process !== 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY) || 
                    (typeof process !== 'undefined' && process.env.VITE_SUPABASE_ANON_KEY) || 
                    (import.meta && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabaseAdmin = createClient(
    supabaseUrl || '',
    supabaseKey || '',
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    }
);
