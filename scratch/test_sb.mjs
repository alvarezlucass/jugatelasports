import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testSupabaseOr() {
    const homeName = "Tristan Suarez";
    const awayName = "Almagro";
    
    // Test the exact string used in predictionEngine.ts
    const queryString = 'and(home_team.eq."' + homeName + '",away_team.eq."' + awayName + '"),and(home_team.eq."' + awayName + '",away_team.eq."' + homeName + '")';
    console.log("Query String:", queryString);

    const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(queryString)
        .limit(5);

    console.log("Error:", error);
    
    const qs2 = 'home_team.eq."' + homeName + '",away_team.eq."' + homeName + '"';
    const { data: d2, error: e2 } = await supabase.from('matches').select('*').or(qs2).limit(5);
    console.log("Error 2:", e2);
}
testSupabaseOr();
