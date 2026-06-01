import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    const { data: matchesWithoutDetails, error: checkError } = await supabase
        .from('matches')
        .select('id, start_time, home_team, away_team, status, metadata')
        .eq('league_id', '2')
        .in('status', ['FINISHED', 'LIVE'])
        .order('start_time', { ascending: false })
        .limit(20);

    console.log('Matches returned by query:', matchesWithoutDetails?.length);
    matchesWithoutDetails?.forEach(m => {
        const hasLineup = !!m.metadata?.lineup_home;
        console.log(`ID: ${m.id} | ${m.home_team} vs ${m.away_team} | Start: ${m.start_time} | Status: ${m.status} | Has lineup: ${hasLineup}`);
    });
    
    process.exit(0);
}
run();
