import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkTodayMatches() {
    const { data: matches } = await supabase.from('matches')
        .select('id, home_team, away_team, start_time')
        .gte('start_time', '2026-06-11T00:00:00Z')
        .lt('start_time', '2026-06-12T00:00:00Z')
        .order('start_time');
    console.log(matches);
}
checkTodayMatches();
