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
    const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .eq('league_id', '13')
        .eq('status', 'FINISHED')
        .limit(5);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log(`Fetched ${matches.length} finished matches.`);
        matches.forEach(m => {
            console.log(`Match: ${m.home_team} vs ${m.away_team}`);
            console.log(`- Score: ${m.home_score} - ${m.away_score}`);
            console.log(`- Time: ${m.start_time}`);
            console.log(`- Stats present: ${!!m.metadata?.stats}`);
            console.log(`- Lineups present: ${!!m.metadata?.lineup_home && !!m.metadata?.lineup_away}`);
            console.log(`- Events count: ${m.metadata?.events?.length || 0}`);
            console.log(`- AI Prediction present: ${!!m.metadata?.ai_prediction}`);
            console.log(`- H2H count: ${m.metadata?.h2h?.length || 0}`);
            console.log("------------------------");
        });
    }
}

inspect();
