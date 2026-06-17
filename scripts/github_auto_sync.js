// scripts/github_auto_sync.js
// Sincronizador automático para GitHub Actions

import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const API_FOOTBALL_KEY = process.env.VITE_API_FOOTBALL_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !API_FOOTBALL_KEY) {
    console.error('ERROR: Faltan variables de entorno necesarias.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function sync() {
    console.log(`[${new Date().toISOString()}] Iniciando Auto-Sync desde GitHub Actions...`);

    try {
        const { data: matches, error } = await supabase
            .from('matches')
            .select('*')
            .in('status', ['UPCOMING', 'SCHEDULED', 'NS', 'LIVE', '1H', '2H', 'HT', 'ET', 'P', 'BT', 'INT']);

        if (error) {
            console.error('Error al obtener partidos de Supabase:', error);
            process.exit(1);
        }

        if (!matches || matches.length === 0) {
            console.log('No hay partidos programados o en vivo para actualizar.');
            process.exit(0);
        }

        const today = new Date().toISOString().split('T')[0];
        console.log(`Consultando API para todos los partidos del día: ${today}...`);
        
        const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
            headers: { 'x-apisports-key': API_FOOTBALL_KEY }
        });
        const data = await res.json();
        
        if (!data.response || data.response.length === 0) {
            console.log('No hay partidos en la API para el día de hoy.');
            process.exit(0);
        }

        const apiFixtures = data.response;
        console.log(`Se encontraron ${apiFixtures.length} partidos en la API para hoy.`);

        let updatesCount = 0;

        for (const match of matches) {
            // Find this match in the API response (either by api_id or id)
            const fixtureData = apiFixtures.find(f => f.fixture.id.toString() === match.api_id?.toString() || f.fixture.id.toString() === match.id.toString());
            
            if (fixtureData) {
                const fixture = fixtureData.fixture;
                const goals = fixtureData.goals;
                const shortStatus = fixture.status.short;

                let newStatus = match.status;
                if (['FT', 'AET', 'PEN'].includes(shortStatus)) newStatus = 'FINISHED';
                else if (['1H', 'HT', '2H', 'ET', 'BT', 'P', 'INT'].includes(shortStatus)) newStatus = 'LIVE';
                else if (['CANC', 'PST', 'ABD'].includes(shortStatus)) newStatus = 'CANCELLED';

                const updates = {};
                let changed = false;

                if (newStatus !== match.status) {
                    updates.status = newStatus;
                    changed = true;
                }

                if (goals.home !== null && goals.home !== match.home_score) {
                    updates.home_score = goals.home;
                    changed = true;
                }

                if (goals.away !== null && goals.away !== match.away_score) {
                    updates.away_score = goals.away;
                    changed = true;
                }

                if (changed) {
                    updates.updated_at = new Date().toISOString();
                    await supabase.from('matches').update(updates).eq('id', match.id);
                    console.log(` -> Sincronizado ${match.home_team} vs ${match.away_team}: ${newStatus} (${goals.home}-${goals.away})`);
                    
                    if (newStatus === 'FINISHED' && match.status !== 'FINISHED') {
                        console.log(` -> Resolviendo recompensas para ${match.home_team} vs ${match.away_team}...`);
                        try {
                            execSync(`npx --yes tsx scripts/resolve_match.ts ${match.id} ${goals.home} ${goals.away}`, { stdio: 'inherit' });
                        } catch (e) {
                            console.error(`Error en la resolución del partido: ${e.message}`);
                        }
                    }
                    
                    updatesCount++;
                }
            }
        }

        console.log(`[${new Date().toISOString()}] Sync completado. Partidos actualizados: ${updatesCount}`);

    } catch (err) {
        console.error('Error durante la sincronización:', err);
        process.exit(1);
    }
}

sync();
