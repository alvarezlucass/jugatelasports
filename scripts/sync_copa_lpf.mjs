import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const HEADERS = {
    'x-rapidapi-key': process.env.VITE_API_FOOTBALL_KEY,
    'x-rapidapi-host': 'v3.football.api-sports.io'
};

const LEAGUE = 128;
const DB_LEAGUE = 'lpf';
const SEASON = 2026;

async function syncCopa() {
    console.log('Fetching teams...');
    const teamsRes = await fetch(`https://v3.football.api-sports.io/teams?league=${LEAGUE}&season=${SEASON}`, { headers: HEADERS });
    const teamsData = await teamsRes.json();
    const teams = teamsData.response.map(item => ({
        id: item.team.id,
        name: item.team.name,
        short_name: item.team.code,
        logo: item.team.logo,
        founded: item.team.founded,
        stadium_name: item.venue.name,
        metadata: { city: item.venue.city, capacity: item.venue.capacity, address: item.venue.address }
    }));
    await supabase.from('teams').upsert(teams, { onConflict: 'id' });
    const relations = teams.map(t => ({ league_id: DB_LEAGUE, team_id: t.id, season: SEASON }));
    await supabase.from('league_teams').upsert(relations, { onConflict: 'league_id, team_id, season' });
    console.log(`Saved ${teams.length} teams.`);

    console.log('Fetching standings...');
    const standRes = await fetch(`https://v3.football.api-sports.io/standings?league=${LEAGUE}&season=${SEASON}`, { headers: HEADERS });
    const standData = await standRes.json();
    if (standData.response && standData.response[0]) {
        // Filter out Anual and Promedios groups, keep only groups A and B (or single table if it's not grouped)
        const filteredGroups = standData.response[0].league.standings.filter(arr => {
            const g = arr[0]?.group || '';
            // If the group says Anual or Promedios, ignore it
            if (g.includes('Anual') || g.includes('Promedio')) return false;
            return true;
        });

        const standings = filteredGroups.flat().map(s => ({
            league_id: DB_LEAGUE,
            season: SEASON,
            team_id: s.team.id,
            rank: s.rank,
            points: s.points,
            played: s.all.played,
            win: s.all.win,
            draw: s.all.draw,
            lose: s.all.lose,
            goals_for: s.all.goals.for,
            goals_against: s.all.goals.against,
            form: s.form,
            group_name: s.group,
            updated_at: new Date().toISOString()
        }));
        await supabase.from('standings').upsert(standings, { onConflict: 'league_id, season, team_id' });
        console.log(`Saved ${standings.length} standings rows.`);
    }

    console.log('Fetching matches...');
    const matchRes = await fetch(`https://v3.football.api-sports.io/fixtures?league=${LEAGUE}&season=${SEASON}`, { headers: HEADERS });
    const matchData = await matchRes.json();
    const matches = matchData.response.map(f => {
        let status = 'UPCOMING';
        if(f.fixture.status.short === 'FT' || f.fixture.status.short === 'AET' || f.fixture.status.short === 'PEN') status = 'FINISHED';
        if(['1H', '2H', 'HT', 'ET', 'P'].includes(f.fixture.status.short)) status = 'LIVE';

        // Extract group from round (e.g. "Regular Season - 1" -> "Group A/B" not available easily, but we have f.league.round)
        return {
            id: f.fixture.id.toString(),
            league_id: DB_LEAGUE,
            home_team: f.teams.home.name,
            away_team: f.teams.away.name,
            home_team_logo: f.teams.home.logo,
            away_team_logo: f.teams.away.logo,
            start_time: f.fixture.date,
            status: status,
            home_score: f.goals.home,
            away_score: f.goals.away,
            metadata: {
                round: f.league.round,
                stadium: f.fixture.venue.name,
                city: f.fixture.venue.city,
                penalty_home: f.score.penalty.home,
                penalty_away: f.score.penalty.away,
                group: f.league.round
            }
        };
    });
    
    // Process in batches
    for (let i = 0; i < matches.length; i += 100) {
        const batch = matches.slice(i, i + 100);
        await supabase.from('matches').upsert(batch, { onConflict: 'id' });
    }
    console.log(`Saved ${matches.length} matches.`);
    
    // Also simulate some upcoming matches in 2026 for Copa de la LPF since we are in 2026!
    console.log('Simulating some future matches so predictions work in 2026...');
    const now = new Date();
    for (let i = 1; i <= 5; i++) {
        now.setDate(now.getDate() + 1);
        const matchId = `sim-copa-${i}`;
        const match = {
            id: matchId,
            league_id: DB_LEAGUE,
            home_team: teams[i % teams.length].name,
            away_team: teams[(i + 1) % teams.length].name,
            home_team_logo: teams[i % teams.length].logo,
            away_team_logo: teams[(i + 1) % teams.length].logo,
            start_time: now.toISOString(),
            status: 'UPCOMING',
            home_score: null,
            away_score: null,
            metadata: { round: 'Simulated 2026', group: 'Simulated' }
        };
        await supabase.from('matches').upsert(match, { onConflict: 'id' });
    }
    console.log('Done.');
}

syncCopa().catch(console.error);
