import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function deleteDuplicates() {
    let allMatches = [];
    let from = 0;
    const step = 1000;
    
    while (true) {
        const { data: matches, error } = await supabase
            .from('matches')
            .select('*')
            .range(from, from + step - 1);

        if (error) {
            console.error('Error fetching matches:', error);
            return;
        }

        if (matches.length === 0) {
            break;
        }

        allMatches = allMatches.concat(matches);
        from += step;
    }

    console.log(`Fetched ${allMatches.length} matches.`);

    const wcMatches = allMatches.filter(m => m.league_id === 'world-cup-2026' || m.league_id === '128' || m.league_id === 'World Cup' || (m.home_team && m.home_team.toLowerCase().includes('brazil')));

    // We keep the Spanish manual ones (IDs like m1, m2...)
    // We delete the English API ones (IDs that are purely numeric)
    const toDelete = wcMatches.filter(m => /^\d+$/.test(m.id));

    console.log(`Found ${toDelete.length} matches to delete (numeric IDs, english names).`);
    
    const idsToDelete = toDelete.map(m => m.id);
    
    if (idsToDelete.length === 0) {
        console.log('No matches to delete.');
        return;
    }

    // Delete in batches of 50 to avoid any limits
    let deletedCount = 0;
    for (let i = 0; i < idsToDelete.length; i += 50) {
        const batch = idsToDelete.slice(i, i + 50);
        const { error } = await supabase
            .from('matches')
            .delete()
            .in('id', batch);
            
        if (error) {
            console.error('Error deleting batch:', error);
        } else {
            deletedCount += batch.length;
            console.log(`Deleted batch of ${batch.length} matches. (${deletedCount}/${idsToDelete.length})`);
        }
    }
    
    console.log('Finished deleting duplicate World Cup matches.');
}

deleteDuplicates();
