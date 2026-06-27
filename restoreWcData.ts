import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

import { WORLD_CUP_GROUP_MATCHES, WORLD_CUP_TEAMS_HISTORY } from './src/data/worldCupPersistence.ts';

async function restoreWorldCupData() {
    console.log('Restaurando datos del Mundial en la base de datos...');
    try {
        // First delete all corrupted matches to be safe
        console.log('Borrando partidos corruptos...');
        const { error: delErr } = await supabase
            .from('matches')
            .delete()
            .in('league_id', ['world-cup-2026', 'auto-generated']);
            
        if (delErr) {
            console.error('Error al borrar:', delErr);
        }

        // Then insert the fresh dummy data
        console.log('Insertando dummy data fresca...');
        const matchesToSync = WORLD_CUP_GROUP_MATCHES.map(m => ({
            id: m.id,
            league_id: 'world-cup-2026',
            season: 2026,
            home_team: m.homeTeam,
            away_team: m.awayTeam,
            start_time: `${m.date}T${m.time}:00Z`,
            status: m.status.toUpperCase(),
            home_score: m.homeScore || 0,
            away_score: m.awayScore || 0,
            metadata: {
                group: m.group,
                stadium: m.stadium,
                city: m.city,
                static_data: WORLD_CUP_TEAMS_HISTORY[m.homeTeam] || null
            }
        }));

        const { error: matchError } = await supabase
            .from('matches')
            .upsert(matchesToSync, { onConflict: 'id' });

        if (matchError) throw matchError;

        console.log('Partidos restaurados correctamente.');
    } catch (error) {
        console.error('Error en restauración:', error);
    }
}

restoreWorldCupData();
