import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    // Let's check team names and IDs first
    const { data: teams, error: teamErr } = await supabase
        .from('teams')
        .select('id, name')
        .in('name', ['Paris Saint Germain', 'Arsenal']);
    
    if (teamErr) {
        console.error(teamErr);
        process.exit(1);
    }
    console.log('Teams:', teams);

    for (const team of teams || []) {
        const { data: players, error: playerErr } = await supabase
            .from('players')
            .select('id, name, position, number')
            .eq('team_id', team.id);
        
        console.log(`Team: ${team.name} has ${players?.length} players`);
        if (players && players.length > 0) {
            console.log('Sample players:', players.slice(0, 5));
        }

        const { data: coaches, error: coachErr } = await supabase
            .from('coaches')
            .select('id, name, role')
            .eq('team_id', team.id);
        
        console.log(`Team: ${team.name} has ${coaches?.length} coaches:`, coaches);
    }

    process.exit(0);
}

run();
