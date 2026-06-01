import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    console.log('Authenticating as admin...');
    const { error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@jugatelasports.com',
        password: '@Marte2026',
    });
    if (authError) {
        console.error('Auth error:', authError.message);
        process.exit(1);
    }

    console.log('Retrieving World Cup team IDs...');
    const { data: wcRelations } = await supabase
        .from('league_teams')
        .select('team_id')
        .eq('league_id', 'world-cup-2026');
        
    const wcTeamIds = (wcRelations || []).map(r => r.team_id);
    console.log(`Found ${wcTeamIds.length} World Cup teams.`);

    if (wcTeamIds.length > 0) {
        console.log('Clearing players for World Cup teams in database...');
        const { error: playErr } = await supabase
            .from('players')
            .delete()
            .in('team_id', wcTeamIds);
            
        if (playErr) {
            console.error('Error clearing players:', playErr.message);
        } else {
            console.log('Successfully cleared players.');
        }

        console.log('Clearing coaches for World Cup teams in database...');
        const { error: coachErr } = await supabase
            .from('coaches')
            .delete()
            .in('team_id', wcTeamIds);
            
        if (coachErr) {
            console.error('Error clearing coaches:', coachErr.message);
        } else {
            console.log('Successfully cleared coaches.');
        }
    }

    process.exit(0);
}

main();
