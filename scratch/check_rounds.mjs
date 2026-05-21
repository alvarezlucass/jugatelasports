import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    try {
        const { data, error } = await supabase
            .from('matches')
            .select('metadata')
            .eq('league_id', '128')
            .limit(10);
            
        if (error) throw error;
        console.log('Sample rounds:', data.map(d => d.metadata?.round));
    } catch (e) {
        console.error(e);
    }
}

check();
