import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const { data, error } = await supabase
        .from('matches')
        .select('league_id, season, status');
        
    if (error) {
        console.error(error);
        return;
    }
    
    const counts = {};
    for (const m of data) {
        const key = `League: ${m.league_id} | Season: ${m.season} | Status: ${m.status}`;
        counts[key] = (counts[key] || 0) + 1;
    }
    
    console.log(JSON.stringify(counts, null, 2));
    process.exit(0);
}

check();
