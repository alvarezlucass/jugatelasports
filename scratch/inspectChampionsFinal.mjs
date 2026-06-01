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
    console.log("Fetching Champions League matches in the database (league_id = '2'):");
    const { data: matches, error } = await supabase
        .from('matches')
        .select('id, home_team, away_team, start_time, status, home_score, away_score, metadata')
        .eq('league_id', '2')
        .order('start_time', { ascending: false });

    if (error) {
        console.error("Error:", error);
    } else {
        console.log(`Found ${matches.length} matches.`);
        const finals = matches.filter(m => m.metadata?.round?.toLowerCase().includes('final') && !m.metadata?.round?.toLowerCase().includes('semi') && !m.metadata?.round?.toLowerCase().includes('quarter'));
        console.log(`Found ${finals.length} final matches:`);
        finals.forEach(m => {
            console.log(`- ID: ${m.id}, ${m.home_team} vs ${m.away_team}, Time: ${m.start_time}, Status: ${m.status}, Score: ${m.home_score} - ${m.away_score}, Round: ${m.metadata?.round}`);
        });
        
        if (matches.length > 0 && finals.length === 0) {
            console.log("Sample of recent matches:");
            matches.slice(0, 10).forEach(m => {
                console.log(`- ID: ${m.id}, ${m.home_team} vs ${m.away_team}, Time: ${m.start_time}, Status: ${m.status}, Score: ${m.home_score} - ${m.away_score}, Round: ${m.metadata?.round}`);
            });
        }
    }
}

inspect();
