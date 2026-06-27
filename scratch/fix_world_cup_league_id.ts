import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixLeagueId() {
    console.log('Fijando league_id de auto-generated a world-cup-2026 para los partidos del mundial...');
    try {
        const { error } = await supabase
            .from('matches')
            .update({ league_id: 'world-cup-2026' })
            .eq('league_id', 'auto-generated');
            
        if (error) {
            console.error('Error al actualizar:', error);
        } else {
            console.log('Partidos actualizados correctamente.');
        }
    } catch (error) {
        console.error('Excepción:', error);
    }
}

fixLeagueId();
