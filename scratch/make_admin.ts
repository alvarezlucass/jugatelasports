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

async function run() {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@jugatelasports.com',
        password: '@Marte2026'
    });

    if (authError) {
        console.error('Auth error:', authError.message);
        process.exit(1);
    }

    const userId = authData.user?.id;
    console.log('Logged in user ID:', userId);

    const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (fetchError) {
        console.error('Error fetching profile:', fetchError.message);
    } else {
        console.log('Current profile:', profile);
    }

    console.log('Attempting to update role to ADMIN...');
    const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'ADMIN' })
        .eq('id', userId)
        .select();

    if (updateError) {
        console.error('Update error:', updateError.message);
    } else {
        console.log('Update success:', updateData);
    }
}

run();
