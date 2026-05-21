import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function clean() {
    try {
        console.log('Cleaning matches with league_id = worldcup2026...');
        const { data, error } = await supabase
            .from('matches')
            .delete()
            .eq('league_id', 'worldcup2026');
            
        if (error) {
            console.error('Error deleting orphan matches:', error);
        } else {
            console.log('Orphan matches deleted successfully.');
        }
    } catch (e) {
        console.error(e);
    }
}

clean();
