// scripts/github_auto_sync.js
// Sincronizador automático para GitHub Actions

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
// GitHub Actions runs Node 20+, which has native fetch.

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

        const now = Date.now();
        const eligibleMatches = matches.filter(m => {
            if (!m.start_time) return false;
            const matchTime = new Date(m.start_time).getTime();
            const elapsedMins = (now - matchTime) / 60000;
            return elapsedMins >= -10 && elapsedMins <= 4320; 
        });

        if (eligibleMatches.length === 0) {
            console.log('No hay partidos en la ventana de tiempo activa (-10 mins a 72 hs).');
            process.exit(0);
        }

        console.log(`Se encontraron ${eligibleMatches.length} partidos elegibles.`);

        let updatesCount = 0;

        for (const match of eligibleMatches) {
            const apiId = match.api_id || match.id;
            console.log(`Consultando API para partido ID: ${match.id} (API ID: ${apiId})...`);

            const res = await fetch(`https://v3.football.api-sports.io/fixtures?id=${apiId}`, {
                headers: { 'x-apisports-key': API_FOOTBALL_KEY }
            });
            const data = await res.json();
            
            if (data.response && data.response[0]) {
                const fixture = data.response[0].fixture;
                const goals = data.response[0].goals;
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
                    updatesCount++;
                } else {
                    console.log(` -> Sin cambios para ${match.home_team} vs ${match.away_team} (${shortStatus})`);
                }
            } else {
                console.log(` -> Advertencia: No se encontraron datos en la API para ID ${apiId}`);
            }
        }

        console.log(`[${new Date().toISOString()}] Sync completado. Partidos actualizados: ${updatesCount}`);

    } catch (err) {
        console.error('Error durante la sincronización:', err);
        process.exit(1);
    }
}

sync();
