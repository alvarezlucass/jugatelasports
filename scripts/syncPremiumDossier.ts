import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const API_KEY = process.env.VITE_API_FOOTBALL_KEY;
const API_URL = process.env.VITE_API_FOOTBALL_URL || 'https://v3.football.api-sports.io';

const args = process.argv.slice(2);
const TEAM_ID = args[0] ? parseInt(args[0], 10) : 484; // Default to Chicago
const LEAGUE_ID = args[1] ? parseInt(args[1], 10) : 129; // Default to Primera Nacional
const TARGET_SEASON = args[2] ? parseInt(args[2], 10) : 2024; // Default to 2024

async function fetchFromApi(endpoint: string, params: Record<string, any> = {}) {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${API_URL}/${endpoint}?${queryParams}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': API_KEY
            }
        });
        const json = await response.json();
        return json.response;
    } catch (error) {
        console.error(`Request to ${endpoint} failed:`, error);
        return null;
    }
}

async function syncPremiumDossier() {
    console.log(`Iniciando sincronización Premium para el Equipo ${TEAM_ID}...`);

    try {
        // 1. Sincronizar Histórico de Posiciones (Standings)
        console.log('\n--- 1. Sincronizando Histórico de Posiciones ---');
        // We will fetch historical standings from API for the last 3 available seasons in API (e.g., 2023, 2024)
        for (const year of [2022, 2023, 2024]) {
            const standingsRes = await fetchFromApi('standings', { league: LEAGUE_ID, season: year, team: TEAM_ID });
            if (standingsRes && standingsRes.length > 0) {
                const standing = standingsRes[0].league.standings[0].find((s: any) => s.team.id === TEAM_ID);
                if (standing) {
                    await supabase.from('standings').upsert({
                        league_id: `api-${LEAGUE_ID}`,
                        season: year,
                        team_id: TEAM_ID,
                        rank: standing.rank,
                        points: standing.points,
                        played: standing.all.played,
                        win: standing.all.win,
                        draw: standing.all.draw,
                        lose: standing.all.lose,
                        goals_for: standing.all.goals.for,
                        goals_against: standing.all.goals.against,
                        form: standing.form,
                        group_name: standing.group
                    }, { onConflict: 'league_id,season,team_id' });
                    console.log(`Guardado standing ${year}: Posición #${standing.rank}`);
                }
            }
        }

        // 1.5 Sincronizar Coach
        console.log('\n--- 1.5 Sincronizando Coach ---');
        const coachRes = await fetchFromApi('coachs', { team: TEAM_ID });
        if (coachRes && coachRes.length > 0) {
             const coach = coachRes[0];
             console.log(`Coach encontrado: ${coach.name}`);
             
             // Update the team's metadata with coach info
             const { data: teamData } = await supabase.from('teams').select('metadata').eq('id', TEAM_ID).single();
             const newMetadata = { ...(teamData?.metadata || {}), coach: { name: coach.name, photo: coach.photo, nationality: coach.nationality } };
             
             await supabase.from('teams').update({ metadata: newMetadata }).eq('id', TEAM_ID);
        }

        // 2. Sincronizar Jugadores (Squad Completo + Deep Stats parcial)
        console.log('\n--- 2. Sincronizando Plantel Profundo ---');
        const squadRes = await fetchFromApi('players/squads', { team: TEAM_ID });
        if (squadRes && squadRes.length > 0) {
            const players = squadRes[0].players;
            console.log(`Se encontraron ${players.length} jugadores en el plantel.`);
            
            // Limit deep stats to avoid API rate limits, but save basic info for EVERYONE
            const deepStatsLimit = 5; 
            
            for (let i = 0; i < players.length; i++) {
                const player = players[i];
                console.log(`Sincronizando a ${player.name} (${player.id})...`);
                
                let metadata: any = {};
                
                if (i < deepStatsLimit) {
                    // Fetch Deep Stats
                    const statsRes = await fetchFromApi('players', { id: player.id, season: TARGET_SEASON });
                    const playerStats = statsRes?.[0]?.statistics?.[0] || {};
                    
                    // Fetch Transfers
                    const transfersRes = await fetchFromApi('transfers', { player: player.id });
                    const transfers = transfersRes?.[0]?.transfers || [];
                    
                    metadata = { deepStats: playerStats, transfers: transfers };
                }

                await supabase.from('players').upsert({
                    id: player.id,
                    team_id: TEAM_ID,
                    name: player.name,
                    age: player.age,
                    number: player.number,
                    position: player.position,
                    photo: player.photo,
                    metadata: metadata
                }, { onConflict: 'id' });
            }
        }

        // 3. Sincronizar Estadísticas Avanzadas de Partidos
        console.log('\n--- 3. Sincronizando Advanced Match Analytics ---');
        const fixturesRes = await fetchFromApi('fixtures', { team: TEAM_ID, season: TARGET_SEASON, last: 5 });
        if (fixturesRes && fixturesRes.length > 0) {
            for (const f of fixturesRes) {
                console.log(`Obteniendo stats para partido ${f.fixture.id} (${f.teams.home.name} vs ${f.teams.away.name})`);
                const matchStatsRes = await fetchFromApi('fixtures/statistics', { fixture: f.fixture.id });
                
                if (matchStatsRes && matchStatsRes.length > 0) {
                    // Find Chicago's stats
                    const teamStats = matchStatsRes.find((s: any) => s.team.id === TEAM_ID)?.statistics || [];
                    
                    const advancedStats = teamStats.reduce((acc: any, curr: any) => {
                        acc[curr.type] = curr.value;
                        return acc;
                    }, {});

                    // Upsert Match with advanced metadata
                    await supabase.from('matches').upsert({
                        id: f.fixture.id.toString(),
                        league_id: `api-${LEAGUE_ID}`,
                        season: TARGET_SEASON,
                        home_team: f.teams.home.name,
                        away_team: f.teams.away.name,
                        start_time: f.fixture.date,
                        status: f.fixture.status.short,
                        home_score: f.goals.home,
                        away_score: f.goals.away,
                        metadata: { advancedStats }
                    }, { onConflict: 'id' });
                }
            }
        }

        console.log('\n¡Sincronización Premium completada con éxito!');
    } catch (error) {
        console.error("Error durante la sincronización:", error);
    }
}

syncPremiumDossier();
