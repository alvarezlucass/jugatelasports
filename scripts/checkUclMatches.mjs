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
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    console.log('Querying UCL matches in DB...');
    const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .eq('league_id', '2') // UCL API id is 2
        .order('start_time', { ascending: false });

    if (error) {
        console.error(error);
        process.exit(1);
    }

    console.log(`Total UCL matches: ${matches?.length}`);
    const finished = matches?.filter(m => m.status === 'FINISHED') || [];
    console.log(`Finished UCL matches: ${finished.length}`);
    
    // Print details of the 5 most recent finished UCL matches
    finished.slice(0, 5).forEach(m => {
        const hasLineupHome = !!m.metadata?.lineup_home;
        const hasStats = !!m.metadata?.stats;
        const hasEvents = !!m.metadata?.events;
        console.log(`Match: ${m.id} | ${m.home_team} vs ${m.away_team} | Date: ${m.start_time} | Status: ${m.status}`);
        console.log(`  Lineup: ${hasLineupHome ? 'YES' : 'NO'}, Stats: ${hasStats ? 'YES' : 'NO'}, Events: ${hasEvents ? 'YES' : 'NO'}`);
    });

    process.exit(0);
}

run();
