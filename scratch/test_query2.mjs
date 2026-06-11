import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testQuery2() {
    const homeName = "Tristan Suarez";
    const queryString = 'home_team.eq."' + homeName + '",away_team.eq."' + homeName + '"';
    
    console.log("Querying Recent with:", queryString);
    const { data: recentData, error } = await supabase
        .from('matches')
        .select('*')
        .or(queryString)
        .eq('status', 'FINISHED')
        .limit(5);

    if (error) {
        console.error("SUPABASE ERROR:", error);
    } else {
        console.log("Recent Result:", recentData);
    }
}
testQuery2();
