import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testQuery() {
    // 1. Fetch
    const { data: m } = await supabase.from('matches').select('*').eq('id', '1498594').single();
    
    // 2. Mock prediction engine
    const homeName = m.home_team;
    const queryString = 'and(home_team.eq."' + homeName + '",away_team.eq."' + m.away_team + '"),and(home_team.eq."' + m.away_team + '",away_team.eq."' + homeName + '")';
    
    console.log("Querying H2H with:", queryString);
    const { data: h2hData, error } = await supabase
        .from('matches')
        .select('*')
        .or(queryString)
        .eq('status', 'FINISHED')
        .neq('id', m.id)
        .not('home_score', 'is', null)
        .order('start_time', { ascending: false })
        .limit(5);

    if (error) {
        console.error("SUPABASE ERROR:", error);
    } else {
        console.log("H2H Result:", h2hData);
    }
}
testQuery();
