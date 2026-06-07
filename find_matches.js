import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function findMatches() {
    const today = new Date();
    today.setUTCHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const { data, error } = await supabase
        .from('matches')
        .select('*')
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString());
        
    if (error) {
        console.error('Error fetching matches:', error);
        return;
    }
    
    console.log(`Matches today (${today.toISOString()}):`);
    data.forEach(m => {
        console.log(`${m.id} | ${m.league_id} | ${m.home_team} vs ${m.away_team} | Date: ${m.start_time} | Status: ${m.status}`);
    });
}

findMatches();
