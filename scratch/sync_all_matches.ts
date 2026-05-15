import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const apiFootballKey = process.env.VITE_API_FOOTBALL_KEY!;
const apiFootballUrl = process.env.VITE_API_FOOTBALL_URL || 'https://v3.football.api-sports.io';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fetchFootball(endpoint: string, params: Record<string, string>) {
    const url = new URL(`${apiFootballUrl}/${endpoint}`);
    Object.entries(params).forEach(([key, val]) => url.searchParams.append(key, val));
    const res = await fetch(url.toString(), {
        headers: { 'x-apisports-key': apiFootballKey }
    });
    return res.json();
}

async function syncAll() {
    console.log('--- INICIANDO SINCRONIZACIÓN TOTAL DE PARTIDOS ---');

    // 1. SINCRONIZAR MUNDIAL (Datos Estáticos + Muequeo de IDs)
    console.log('\n1. Sincronizando Partidos del Mundial...');
    // Aquí podríamos llamar a una lógica similar a la de databaseService.syncWorldCupData()
    // Para simplificar, insertamos los que el frontend pide (ej: m25)
    const worldCupMatches = [
        { id: 'm25', league_id: 'wc', home_team: 'Argentina', away_team: 'Francia', status: 'finished', home_score: 3, away_score: 3, start_time: '2022-12-18T15:00:00Z' },
        { id: 'm24', league_id: 'wc', home_team: 'Croacia', away_team: 'Marruecos', status: 'finished', home_score: 2, away_score: 1, start_time: '2022-12-17T15:00:00Z' }
    ];
    await supabase.from('matches').upsert(worldCupMatches);
    console.log('- Partidos del Mundial (demo/final) cargados.');

    // 2. SINCRONIZAR LPF 2024 (Datos Reales de API)
    console.log('\n2. Sincronizando Fixture de la Liga Profesional Argentina 2024...');
    const matchData = await fetchFootball('fixtures', { league: '128', season: '2024' });
    
    if (matchData.response && matchData.response.length > 0) {
        const matches = matchData.response.map((m: any) => ({
            id: `lpf-${m.fixture.id}`,
            league_id: 'lpf',
            season: 2024,
            home_team: m.teams.home.name,
            home_team_logo: m.teams.home.logo,
            away_team: m.teams.away.name,
            away_team_logo: m.teams.away.logo,
            start_time: m.fixture.date,
            status: m.fixture.status.short === 'FT' ? 'FINISHED' : m.fixture.status.short === 'NS' ? 'SCHEDULED' : 'LIVE',
            home_score: m.goals.home,
            away_score: m.goals.away,
            metadata: { round: m.league.round }
        }));

        const { error } = await supabase.from('matches').upsert(matches);
        if (error) console.error('Error sincronizando LPF:', error.message);
        else console.log(`- ${matches.length} partidos de la LPF cargados con éxito.`);
    }

    // 3. ACTUALIZAR BALANCES (Bonus Retroactivo)
    console.log('\n3. Actualizando balances de usuarios existentes (+1000 tokens)...');
    const { data: profiles } = await supabase.from('profiles').select('id, total_balance');
    if (profiles) {
        for (const p of profiles) {
            // Solo sumamos si el balance es menor a 2000 (para no duplicar si ya se corrió)
            if (p.total_balance < 2000) {
                const newBalance = p.total_balance + 1000;
                await supabase.from('profiles').update({ 
                    total_balance: newBalance,
                    locked_balance: newBalance // Lo ponemos en locked para que sea coherente con la lógica de ahorro
                }).eq('id', p.id);
                
                await supabase.from('transactions').insert({
                    user_id: p.id,
                    type: 'DAILY_BONUS',
                    amount: 1000,
                    description: 'Ajuste Bono de Bienvenida Jugatela (v2)',
                    balance_after: newBalance
                });
            }
        }
        console.log(`- Balances actualizados para ${profiles.length} usuarios.`);
    }

    console.log('\n--- SINCRONIZACIÓN FINALIZADA CON ÉXITO ---');
}

syncAll().catch(console.error);
