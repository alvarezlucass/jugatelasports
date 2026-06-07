import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function postponeMatches() {
    const matchIds = ['1540060', '1540056', '1540103'];
    
    for (const id of matchIds) {
        const { error } = await supabase
            .from('matches')
            .update({ status: 'POSTPONED' })
            .eq('id', id);
            
        if (error) {
            console.error(`Error updating match ${id}:`, error);
        } else {
            console.log(`Match ${id} marked as POSTPONED`);
        }
    }
}

postponeMatches();
