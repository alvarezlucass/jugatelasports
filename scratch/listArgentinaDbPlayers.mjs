import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const { data: players } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', 26);
        
    console.log(`Team Argentina [26] has ${players?.length || 0} players in DB.`);
    players?.forEach(p => {
        console.log(`- [${p.id}] #${p.number} ${p.name} (${p.position}) - photo: ${p.photo}`);
    });
    
    process.exit(0);
}

main();
