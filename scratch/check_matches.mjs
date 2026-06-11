import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function main() {
    const { data } = await supabase.from('matches').select('id, start_time, home_team, away_team, metadata').eq('league_id', 'world-cup-2026').order('start_time').limit(4);
    console.log(JSON.stringify(data, null, 2));
}
main();
