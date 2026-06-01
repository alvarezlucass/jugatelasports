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

async function inspect() {
    const { data: matchesL, error: mL } = await supabase
        .from('matches')
        .select('id, home_team, away_team, start_time, status, league_id')
        .eq('league_id', 'libertadores');

    const { data: matches13, error: m13 } = await supabase
        .from('matches')
        .select('id, home_team, away_team, start_time, status, league_id')
        .eq('league_id', '13');

    console.log(`Matches for 'libertadores': ${matchesL ? matchesL.length : 0}`);
    console.log(`Matches for '13': ${matches13 ? matches13.length : 0}`);
    
    if (matchesL && matchesL.length > 0) {
        console.log("Sample 'libertadores' matches:", matchesL.slice(0, 3));
    }
}

inspect();
