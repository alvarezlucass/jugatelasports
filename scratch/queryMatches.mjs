import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .eq('league_id', '128')
        .eq('season', 2026)
        .gte('start_time', '2026-07-01T00:00:00+00:00')
        .order('start_time', { ascending: true })
        .limit(10);
    
    if (error) {
        console.error(error);
        process.exit(1);
    }

    console.log('First 10 LPF matches starting July 2026:');
    matches.forEach(m => {
        console.log(`[${m.id}] ${m.start_time} - Round: ${m.metadata?.round} - ${m.home_team} vs ${m.away_team} - Status: ${m.status} - Score: ${m.home_score}-${m.away_score}`);
    });

    process.exit(0);
}

main();
