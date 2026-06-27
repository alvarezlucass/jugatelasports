import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { WORLD_CUP_GROUP_MATCHES } from '../src/data/worldCupPersistence.ts';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixWorldCupGroups() {
    console.log('Restaurando el campo group en la metadata de los partidos del mundial...');
    try {
        // Fetch current matches
        const { data: matches, error: fetchErr } = await supabase
            .from('matches')
            .select('id, metadata')
            .eq('league_id', 'world-cup-2026');
            
        if (fetchErr) throw fetchErr;

        let updated = 0;
        for (const dbMatch of matches) {
            const staticMatch = WORLD_CUP_GROUP_MATCHES.find(m => m.id === dbMatch.id.toString());
            
            if (staticMatch) {
                // Keep existing metadata but inject the correct group
                const newMetadata = {
                    ...dbMatch.metadata,
                    group: staticMatch.group
                };
                
                const { error: updateErr } = await supabase
                    .from('matches')
                    .update({ metadata: newMetadata })
                    .eq('id', dbMatch.id);
                    
                if (updateErr) {
                    console.error(`Error updating match ${dbMatch.id}:`, updateErr);
                } else {
                    updated++;
                }
            }
        }
        
        console.log(`Se actualizaron ${updated} partidos correctamente.`);
    } catch (error) {
        console.error('Excepción:', error);
    }
}

fixWorldCupGroups();
