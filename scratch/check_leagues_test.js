import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkLeagues() {
    const { data, error } = await supabase.from('matches').select('league_id');
    if (error) {
        console.error(error);
        return;
    }
    const leagues = [...new Set(data.map(m => m.league_id))];
    console.log('Distinct leagues in DB:', leagues);
}

checkLeagues();
