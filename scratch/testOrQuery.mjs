import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const { data: teams } = await supabase
        .from('teams')
        .select('id, name, short_name')
        .or('name.ilike.%switz%,name.ilike.%bosnia%,name.ilike.%scot%,name.ilike.%england%,name.ilike.%ivory%,name.ilike.%congo%,name.ilike.%moroc%');
        
    console.log('Matching teams in DB:', teams);
    process.exit(0);
}

main();
