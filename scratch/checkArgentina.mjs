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
        .select('*')
        .ilike('name', '%Argentina%');
        
    console.log('Argentina Teams found in DB:', teams);
    
    if (teams && teams.length > 0) {
        for (const t of teams) {
            const { data: players } = await supabase
                .from('players')
                .select('*')
                .eq('team_id', t.id);
                
            console.log(`Team [${t.id}] ${t.name} has ${players?.length || 0} players in DB.`);
            
            // Look for Emiliano Martinez
            const dibu = players?.find(p => p.name.toLowerCase().includes('martinez') && p.position.toLowerCase().includes('goal'));
            console.log('Is Dibu Martinez in this squad?', dibu || 'NO');
            
            players?.slice(0, 10).forEach(p => {
                console.log(`- [${p.id}] #${p.number} ${p.name} - Pos: ${p.position}`);
            });
        }
    }
    
    process.exit(0);
}

main();
