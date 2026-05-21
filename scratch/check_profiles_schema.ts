import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    // Authenticate first
    await supabase.auth.signInWithPassword({
        email: 'admin@jugatelasports.com',
        password: '@Marte2026'
    });

    console.log('Querying table columns for profiles...');
    // We can query profiles table directly
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error selecting from profiles:', error.message);
    } else {
        console.log('Columns in profiles:', data.length > 0 ? Object.keys(data[0]) : 'No rows found, selecting columns info...');
    }

    // Let's run a select that checks if we can fetch role column explicitly
    const { data: roleData, error: roleError } = await supabase
        .from('profiles')
        .select('role')
        .limit(1);
    if (roleError) {
        console.error('Error selecting role column:', roleError.message);
    } else {
        console.log('Role column check successful:', roleData);
    }
}

check();
