import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const API_FOOTBALL_KEY = process.env.VITE_API_FOOTBALL_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function syncWorldCupWithAPI() {
    console.log('Iniciando sincronización del Mundial 2026 con la API...');

    const { data: wcMatches, error: fetchErr } = await supabase
        .from('matches')
        .select('*')
        .in('league_id', ['world-cup-2026', 'auto-generated']);

    if (fetchErr) {
        console.error('Error fetching WC matches:', fetchErr);
        return;
    }

    const apiMatches = wcMatches.filter(m => !isNaN(parseInt(m.id)));
    console.log(`Verificando ${apiMatches.length} partidos del Mundial en la API...`);

    const chunkSize = 20;
    for (let i = 0; i < apiMatches.length; i += chunkSize) {
        const chunk = apiMatches.slice(i, i + chunkSize);
        const ids = chunk.map(m => m.id).join('-');
        
        try {
            const res = await fetch(`https://v3.football.api-sports.io/fixtures?ids=${ids}`, {
                headers: { 'x-apisports-key': API_FOOTBALL_KEY }
            });
            const data = await res.json();
            
            if (data.response && data.response.length > 0) {
                for (const fixtureData of data.response) {
                    const apiId = fixtureData.fixture.id.toString();
                    const dbMatch = chunk.find(m => m.id === apiId);
                    if (!dbMatch) continue;

                    const fixture = fixtureData.fixture;
                    const goals = fixtureData.goals;
                    const shortStatus = fixture.status.short;

                    let newStatus = dbMatch.status;
                    if (['FT', 'AET', 'PEN'].includes(shortStatus)) newStatus = 'FINISHED';
                    else if (['1H', 'HT', '2H', 'ET', 'BT', 'P', 'INT'].includes(shortStatus)) newStatus = 'LIVE';
                    else if (['CANC', 'PST', 'ABD'].includes(shortStatus)) newStatus = 'CANCELLED';
                    else if (['NS', 'TBD'].includes(shortStatus)) newStatus = 'SCHEDULED';

                    const updates = {
                        start_time: fixture.date, // WE WANT THE API DATE!
                        status: newStatus,
                        home_score: goals.home !== null ? goals.home : 0,
                        away_score: goals.away !== null ? goals.away : 0,
                        updated_at: new Date().toISOString()
                    };

                    await supabase.from('matches').update(updates).eq('id', dbMatch.id);
                    console.log(`-> Actualizado [ID: ${dbMatch.id}] ${dbMatch.home_team} vs ${dbMatch.away_team}: ${newStatus} (${updates.home_score}-${updates.away_score}), Fecha API: ${fixture.date}`);
                }
            }
        } catch (err) {
            console.error('Error in chunk fetch:', err);
        }
    }
    console.log('Sincronización del Mundial completada.');
}

syncWorldCupWithAPI();
