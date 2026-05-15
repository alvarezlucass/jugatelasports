import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno manualmente para Node
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const apiFootballKey = process.env.VITE_API_FOOTBALL_KEY;
const apiFootballUrl = process.env.VITE_API_FOOTBALL_URL || 'https://v3.football.api-sports.io';

if (!supabaseUrl || !supabaseAnonKey || !apiFootballKey) {
    console.error('Faltan claves en el archivo .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fetchFootball(endpoint: string, params: Record<string, string>) {
    const url = new URL(`${apiFootballUrl}/${endpoint}`);
    Object.entries(params).forEach(([key, val]) => url.searchParams.append(key, val));
    
    const res = await fetch(url.toString(), {
        headers: { 'x-apisports-key': apiFootballKey }
    });
    return res.json();
}

async function runSync() {
    console.log('--- INICIANDO CARGA MASIVA LPF ARGENTINA ---');
    const apiLeagueId = 128;
    const leagueId = 'lpf';

    // 1. Sincronizar Equipos
    console.log('1. Sincronizando Clubes...');
    const teamsData = await fetchFootball('teams', { league: '128', season: '2024' });
    const teams = teamsData.response.map((item: any) => ({
        id: item.team.id,
        name: item.team.name,
        short_name: item.team.code,
        logo: item.team.logo,
        founded: item.team.founded,
        stadium_name: item.venue.name,
        colors: { primary: '#74ACDF', secondary: '#FFFFFF' } // Default Albiceleste
    }));
    await supabase.from('teams').upsert(teams, { onConflict: 'id' });
    
    const relations = teams.map((t: any) => ({
        league_id: leagueId,
        team_id: t.id,
        season: 2024
    }));
    await supabase.from('league_teams').upsert(relations, { onConflict: 'league_id, team_id, season' });
    console.log(`- ${teams.length} equipos cargados.`);

    // 2. Sincronizar Posiciones
    console.log('2. Sincronizando Tabla de Posiciones...');
    const standingsData = await fetchFootball('standings', { league: '128', season: '2024' });
    if (standingsData.response?.length > 0) {
        const standings = standingsData.response[0].league.standings[0].map((s: any) => ({
            league_id: leagueId,
            season: 2024,
            team_id: s.team.id,
            rank: s.rank,
            points: s.points,
            played: s.all.played,
            win: s.all.win,
            draw: s.all.draw,
            lose: s.all.lose,
            goals_for: s.all.goals.for,
            goals_against: s.all.goals.against,
            form: s.form
        }));
        await supabase.from('standings').upsert(standings, { onConflict: 'league_id, season, team_id' });
        console.log('- Tabla de posiciones actualizada.');
    }

    // 3. Sincronización Profunda (Secuencial para evitar Rate Limit)
    console.log('3. Iniciando Sincronización Profunda (Planteles, DTs, Trofeos)...');
    console.log('Esto puede tardar unos minutos (84 llamadas a la API)...');

    for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        console.log(`[${i+1}/${teams.length}] Procesando ${team.name}...`);
        
        try {
            // A. Plantel
            const squadData = await fetchFootball('players/squads', { team: team.id.toString() });
            if (squadData.response?.[0]) {
                const players = squadData.response[0].players.map((p: any) => ({
                    id: p.id,
                    team_id: team.id,
                    name: p.name,
                    age: p.age,
                    number: p.number,
                    position: p.position,
                    photo: p.photo
                }));
                await supabase.from('players').upsert(players, { onConflict: 'id' });
            }

            // B. Coach
            const coachData = await fetchFootball('coachs', { team: team.id.toString() });
            if (coachData.response) {
                const coaches = coachData.response.map((c: any) => ({
                    id: c.id,
                    team_id: team.id,
                    name: c.name,
                    age: c.age,
                    photo: c.photo,
                    nationality: c.nationality
                }));
                await supabase.from('coaches').upsert(coaches, { onConflict: 'id' });
            }

            // C. Trofeos
            const trophyData = await fetchFootball('trophies', { team: team.id.toString() });
            if (trophyData.response) {
                const trophies = trophyData.response.map((t: any) => ({
                    team_id: team.id,
                    league: t.league,
                    country: t.country,
                    season: t.season,
                    place: t.place
                }));
                await supabase.from('trophies').delete().eq('team_id', team.id);
                await supabase.from('trophies').insert(trophies);
            }

            // Pausa de cortesía
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            console.error(`- Error en ${team.name}:`, e);
        }
    }

    console.log('--- PROCESO COMPLETADO ---');
}

runSync().catch(console.error);
