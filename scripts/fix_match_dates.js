import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const API_FOOTBALL_KEY = process.env.VITE_API_FOOTBALL_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function syncAllMatches() {
    console.log(`[${new Date().toISOString()}] Iniciando actualización de scores y status...`);

    try {
        let allMatches = [];
        let from = 0;
        const limit = 1000;
        let fetchMore = true;

        while (fetchMore) {
            const { data, error } = await supabase
                .from('matches')
                .select('*')
                .range(from, from + limit - 1);

            if (error) {
                console.error('Error al obtener partidos:', error);
                process.exit(1);
            }

            if (data.length > 0) {
                allMatches = allMatches.concat(data);
                from += limit;
            } else {
                fetchMore = false;
            }
        }

        // Include all matches with numeric ID
        const apiMatches = allMatches.filter(m => !isNaN(parseInt(m.api_id || m.id)));
        
        console.log(`Se encontraron ${apiMatches.length} partidos totales para verificar en la API.`);

        let updatesCount = 0;
        const chunkSize = 20;
        for (let i = 0; i < apiMatches.length; i += chunkSize) {
            const chunk = apiMatches.slice(i, i + chunkSize);
            const ids = chunk.map(m => m.api_id || m.id).join('-');
            
            const res = await fetch(`https://v3.football.api-sports.io/fixtures?ids=${ids}`, {
                headers: { 'x-apisports-key': API_FOOTBALL_KEY }
            });
            const data = await res.json();
            
            if (data.response && data.response.length > 0) {
                for (const fixtureData of data.response) {
                    const apiId = fixtureData.fixture.id.toString();
                    const dbMatch = chunk.find(m => (m.api_id || m.id).toString() === apiId);
                    
                    if (!dbMatch) continue;

                    const fixture = fixtureData.fixture;
                    const goals = fixtureData.goals;
                    const shortStatus = fixture.status.short;

                    let newStatus = dbMatch.status;
                    if (['FT', 'AET', 'PEN'].includes(shortStatus)) newStatus = 'FINISHED';
                    else if (['1H', 'HT', '2H', 'ET', 'BT', 'P', 'INT'].includes(shortStatus)) newStatus = 'LIVE';
                    else if (['CANC', 'PST', 'ABD'].includes(shortStatus)) newStatus = 'CANCELLED';
                    else if (['NS', 'TBD'].includes(shortStatus)) newStatus = 'SCHEDULED';

                    const newStartTime = fixture.date;

                    const updates = {};
                    let changed = false;

                    if (newStatus !== dbMatch.status) {
                        updates.status = newStatus;
                        changed = true;
                    }

                    // ONLY update start_time if it's NOT a world cup match!
                    const isWorldCup = dbMatch.league_id === 'world-cup-2026' || dbMatch.league_id === 'auto-generated';
                    if (!isWorldCup && newStartTime && new Date(newStartTime).getTime() !== new Date(dbMatch.start_time).getTime()) {
                        updates.start_time = newStartTime;
                        changed = true;
                    }

                    if (goals.home !== null && goals.home !== dbMatch.home_score) {
                        updates.home_score = goals.home;
                        changed = true;
                    }

                    if (goals.away !== null && goals.away !== dbMatch.away_score) {
                        updates.away_score = goals.away;
                        changed = true;
                    }

                    if (changed) {
                        updates.updated_at = new Date().toISOString();
                        await supabase.from('matches').update(updates).eq('id', dbMatch.id);
                        console.log(` -> Actualizado [ID: ${dbMatch.id}] ${dbMatch.home_team} vs ${dbMatch.away_team}: ${newStatus} (${goals.home ?? 0}-${goals.away ?? 0})`);
                        updatesCount++;
                    }
                }
            }
            
            await new Promise(r => setTimeout(r, 500));
        }

        console.log(`[${new Date().toISOString()}] Sincronización masiva completada. Partidos corregidos: ${updatesCount}`);

    } catch (err) {
        console.error('Error durante la sincronización:', err);
        process.exit(1);
    }
}

syncAllMatches();
