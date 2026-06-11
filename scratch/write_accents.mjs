const fs = require('fs');
const content = 
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testOrAccents() {
    const homeName = "México";
    const awayName = "Sudáfrica";
    
    const queryString = 'and(home_team.eq."' + homeName + '",away_team.eq."' + awayName + '"),and(home_team.eq."' + awayName + '",away_team.eq."' + homeName + '")';
    console.log("Query String:", queryString);

    const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(queryString)
        .limit(5);

    console.log("Error:", error);
}
testOrAccents();
;
fs.writeFileSync('scratch/test_accents.mjs', content);
