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

    console.log('Fetching LPF matches with round containing clausura...');
    const { data: LPFMatches, error } = await supabase
        .from('matches')
        .select('id, start_time, home_team, away_team, metadata')
        .eq('league_id', '128');

    if (error) {
        console.error('Fetch error:', error.message);
        process.exit(1);
    }

    const clausuraMatches = LPFMatches.filter(m => {
        const round = m.metadata?.round || '';
        return round.toLowerCase().includes('clausura');
    });

    console.log(`Found ${clausuraMatches.length} Clausura matches out of ${LPFMatches.length} LPF matches in DB.`);
    
    if (clausuraMatches.length > 0) {
        const idsToDelete = clausuraMatches.map(m => m.id);
        console.log(`Deleting ${idsToDelete.length} matches...`);
        
        // Delete predictions associated with these matches to avoid foreign key violations, if any exist.
        const { error: deletePredError } = await supabase
            .from('predictions')
            .delete()
            .in('match_id', idsToDelete);
            
        if (deletePredError) {
            console.error('Failed to delete predictions:', deletePredError.message);
        }

        const { data, error: deleteError } = await supabase
            .from('matches')
            .delete()
            .in('id', idsToDelete)
            .select();

        if (deleteError) {
            console.error('Failed to delete matches:', deleteError.message);
        } else {
            console.log(`Successfully deleted ${data?.length || 0} matches from DB.`);
        }
    } else {
        console.log('No Clausura matches to delete.');
    }

    process.exit(0);
}

main();
