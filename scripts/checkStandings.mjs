import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing environment variables.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    console.log('Querying standings table...');
    const { data, error } = await supabase
        .from('standings')
        .select('league_id, season');

    if (error) {
        console.error('Error fetching standings:', error);
        process.exit(1);
    }

    console.log('Standings rows fetched:', data?.length);
    
    const counts = {};
    for (const row of data || []) {
        const key = `${row.league_id} (season: ${row.season})`;
        counts[key] = (counts[key] || 0) + 1;
    }
    console.log('Standings counts by league & season:', counts);

    // Also let's query a sample of standings
    const { data: sample, error: sampleErr } = await supabase
        .from('standings')
        .select('*, teams(name)')
        .limit(5);
    if (sampleErr) {
        console.error('Error sample:', sampleErr);
    } else {
        console.log('Sample Standings:', JSON.stringify(sample, null, 2));
    }

    process.exit(0);
}

check();
