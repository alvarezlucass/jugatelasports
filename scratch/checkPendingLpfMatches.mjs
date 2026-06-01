import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const { data: matches, error } = await supabase
        .from('matches')
        .select('status')
        .eq('league_id', '128');

    if (error) {
        console.error('Fetch error:', error.message);
        process.exit(1);
    }

    const counts = {};
    matches.forEach(m => {
        counts[m.status] = (counts[m.status] || 0) + 1;
    });

    console.log(`Total LPF matches: ${matches.length}`);
    console.log('Status counts:', counts);
    process.exit(0);
}

main();
