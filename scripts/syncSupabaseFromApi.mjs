import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const API_KEY = process.env.VITE_API_FOOTBALL_KEY;
const API_URL = process.env.VITE_API_FOOTBALL_URL || 'https://v3.football.api-sports.io';

if (!SUPABASE_URL || !SUPABASE_KEY || !API_KEY) {
    console.error('Missing required environment variables.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ADMIN_EMAIL = 'admin@jugatelasports.com';
const ADMIN_PASSWORD = '@Marte2026';

const LEAGUES_TO_SYNC = [
    { id: 1, dbId: 'world-cup-2026', season: 2026, name: 'World Cup 2026' },
    { id: 128, dbId: 'lpf', season: 2026, name: 'Liga Profesional Argentina' },
    { id: 129, dbId: 'primera-nacional', season: 2026, name: 'Primera Nacional' },
    { id: 130, dbId: 'copa-argentina', season: 2026, name: 'Copa Argentina' },
    { id: 2, dbId: 'ucl', season: 2025, name: 'UEFA Champions League' },
    { id: 39, dbId: 'premier', season: 2025, name: 'Premier League' },
    { id: 13, dbId: 'libertadores', season: 2026, name: 'Copa Libertadores' },
    { id: 140, dbId: 'laliga', season: 2025, name: 'La Liga' },
    
    // Europa
    { id: 135, dbId: 'serie-a', season: 2025, name: 'Serie A (Italia)' },
    { id: 78, dbId: 'bundesliga', season: 2025, name: 'Bundesliga (Alemania)' },
    { id: 61, dbId: 'ligue1', season: 2025, name: 'Ligue 1 (Francia)' },
    { id: 3, dbId: 'uel', season: 2025, name: 'UEFA Europa League' },
    { id: 94, dbId: 'primeira-liga', season: 2025, name: 'Primeira Liga (Portugal)' },

    // América Latina
    { id: 71, dbId: 'brasileirao', season: 2026, name: 'Campeonato Brasileiro Série A' },
    { id: 262, dbId: 'ligamx', season: 2025, name: 'Liga MX (México)' },
    { id: 239, dbId: 'primera-a-colombia', season: 2026, name: 'Categoría Primera A (Colombia)' },
    { id: 265, dbId: 'primera-chile', season: 2026, name: 'Primera División (Chile)' },
    { id: 268, dbId: 'primera-uruguay', season: 2026, name: 'Primera División (Uruguay)' },
    { id: 11, dbId: 'sudamericana', season: 2026, name: 'Copa Sudamericana' }
];

// Check command line arguments
const args = process.argv.slice(2);
const syncAllData = args.includes('--all') || args.includes('--init');
const leagueArg = args.find(arg => arg.startsWith('--league='));
const leagueFilter = leagueArg ? leagueArg.split('=')[1] : null;

async function authenticateAsAdmin() {
    console.log('Authenticating as admin...');
    const { error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });
    if (error) {
        console.error('Failed to authenticate as admin. Supabase RLS might block inserts if not logged in:', error.message);
    } else {
        console.log('Successfully authenticated as Admin.');
    }
}

async function fetchFromApi(endpoint, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
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
        
        if (json.errors && Object.keys(json.errors).length > 0) {
            console.error(`API Error for ${endpoint}:`, json.errors);
            return null;
        }
        
        return json.response || [];
    } catch (error) {
        console.error(`Request to ${endpoint} failed:`, error);
        return null;
    }
}

function mapStatus(apiStatus) {
    switch (apiStatus) {
        case 'TBD':
        case 'NS': return 'UPCOMING';
        case 'LIVE':
        case '1H':
        case '2H':
        case 'HT': return 'LIVE';
        case 'FT':
        case 'AET':
        case 'PEN': return 'FINISHED';
        case 'CANC':
        case 'PST': return 'CANCELLED';
        default: return 'UPCOMING';
    }
}

async function syncFixtureDetails(fixtureId) {
    console.log(`  -> Syncing details for fixture ${fixtureId}...`);
    
    // Fetch lineups
    const lineups = await fetchFromApi(`fixtures/lineups`, { fixture: fixtureId });
    await new Promise(r => setTimeout(r, 300));
    
    // Fetch stats
    const stats = await fetchFromApi(`fixtures/statistics`, { fixture: fixtureId });
    await new Promise(r => setTimeout(r, 300));
    
    // Fetch events
    const events = await fetchFromApi(`fixtures/events`, { fixture: fixtureId });
    await new Promise(r => setTimeout(r, 300));

    // Fetch AI Predictions
    const predictions = await fetchFromApi(`predictions`, { fixture: fixtureId });
    await new Promise(r => setTimeout(r, 300));
    
    const mapPos = (pos) => {
        switch (pos) {
            case 'G': return 'GK';
            case 'D': return 'DEF';
            case 'M': return 'MID';
            case 'F': return 'FWD';
            default: return 'MID';
        }
    };
    
    const lineup_home = lineups && lineups[0] ? {
        teamId: lineups[0].team.id?.toString() || '',
        formation: lineups[0].formation,
        startXI: (lineups[0].startXI || []).map(item => ({
            player: { id: item.player.id?.toString() || '', name: item.player.name },
            pos: mapPos(item.player.pos),
            grid: item.player.grid || '3:2',
            number: item.player.number
        })),
        substitutes: (lineups[0].substitutes || []).map(item => ({
            player: { id: item.player.id?.toString() || '', name: item.player.name },
            pos: mapPos(item.player.pos),
            grid: '0:0',
            number: item.player.number
        })),
        staff: lineups[0].coach ? [{ name: lineups[0].coach.name, role: 'Head Coach' }] : []
    } : null;

    const lineup_away = lineups && lineups[1] ? {
        teamId: lineups[1].team.id?.toString() || '',
        formation: lineups[1].formation,
        startXI: (lineups[1].startXI || []).map(item => ({
            player: { id: item.player.id?.toString() || '', name: item.player.name },
            pos: mapPos(item.player.pos),
            grid: item.player.grid || '3:2',
            number: item.player.number
        })),
        substitutes: (lineups[1].substitutes || []).map(item => ({
            player: { id: item.player.id?.toString() || '', name: item.player.name },
            pos: mapPos(item.player.pos),
            grid: '0:0',
            number: item.player.number
        })),
        staff: lineups[1].coach ? [{ name: lineups[1].coach.name, role: 'Head Coach' }] : []
    } : null;

    const findStatVal = (statsList, type) => {
        if (!statsList) return 0;
        const stat = statsList.find(s => s.type === type);
        if (!stat || stat.value === null || stat.value === undefined) return 0;
        if (typeof stat.value === 'string' && stat.value.endsWith('%')) {
            return parseInt(stat.value.replace('%', ''));
        }
        return parseInt(stat.value);
    };

    const homeStats = stats && stats[0] ? stats[0].statistics : null;
    const awayStats = stats && stats[1] ? stats[1].statistics : null;

    const mappedStats = stats && stats.length >= 2 ? {
        possession: { home: findStatVal(homeStats, 'Ball Possession'), away: findStatVal(awayStats, 'Ball Possession') },
        shots: { home: findStatVal(homeStats, 'Total Shots'), away: findStatVal(awayStats, 'Total Shots') },
        shotsOnGoal: { home: findStatVal(homeStats, 'Shots on Goal'), away: findStatVal(awayStats, 'Shots on Goal') },
        passes: { home: findStatVal(homeStats, 'Total passes'), away: findStatVal(awayStats, 'Total passes') },
        corners: { home: findStatVal(homeStats, 'Corner Kicks'), away: findStatVal(awayStats, 'Corner Kicks') },
        passAccuracy: { home: findStatVal(homeStats, 'Passes %'), away: findStatVal(awayStats, 'Passes %') },
        fouls: { home: findStatVal(homeStats, 'Fouls'), away: findStatVal(awayStats, 'Fouls') },
        offsides: { home: findStatVal(homeStats, 'Offsides'), away: findStatVal(awayStats, 'Offsides') },
        yellowCards: { home: findStatVal(homeStats, 'Yellow Cards'), away: findStatVal(awayStats, 'Yellow Cards') },
        redCards: { home: findStatVal(homeStats, 'Red Cards'), away: findStatVal(awayStats, 'Red Cards') }
    } : null;

    const mappedEvents = (events || []).map((e, idx) => ({
        id: `e-${fixtureId}-${idx}`,
        time: e.time.elapsed + (e.time.extra || 0),
        type: e.type === 'Goal' ? 'GOAL' : e.type === 'Card' ? 'CARD' : e.type === 'subst' ? 'SUB' : e.type === 'Var' ? 'VAR' : 'CARD',
        teamId: e.team.id.toString(),
        player: { id: e.player.id ? e.player.id.toString() : '0', name: e.player.name },
        assistPlayer: e.assist && e.assist.id ? { id: e.assist.id.toString(), name: e.assist.name } : undefined,
        detail: e.detail + (e.comments ? ` (${e.comments})` : '')
    }));

    const mappedPrediction = predictions && predictions[0] ? {
        advice: predictions[0].predictions.advice,
        percent: {
            home: predictions[0].predictions.percent.home,
            draw: predictions[0].predictions.percent.draw,
            away: predictions[0].predictions.percent.away
        },
        comparison: {
            form: { home: predictions[0].comparison.form.home, away: predictions[0].comparison.form.away },
            att: { home: predictions[0].comparison.att.home, away: predictions[0].comparison.att.away },
            def: { home: predictions[0].comparison.def.home, away: predictions[0].comparison.def.away }
        }
    } : null;

    // Get current match row to read home_id and away_id for H2H
    const { data: matchObj } = await supabase
        .from('matches')
        .select('metadata')
        .eq('id', fixtureId.toString())
        .single();
    
    const currentMeta = matchObj ? matchObj.metadata || {} : {};
    const homeId = currentMeta.home_id;
    const awayId = currentMeta.away_id;
    
    let mappedH2h = currentMeta.h2h || [];
    
    if (homeId && awayId) {
        console.log(`  -> Fetching H2H between team ${homeId} and team ${awayId}...`);
        const h2h = await fetchFromApi(`fixtures/headtohead`, { h2h: `${homeId}-${awayId}` });
        await new Promise(r => setTimeout(r, 300));
        
        if (h2h && h2h.length > 0) {
            mappedH2h = h2h.slice(0, 5).map(item => ({
                competition: item.league.name + ' - ' + item.league.round,
                result: `${item.teams.home.name} ${item.goals.home} - ${item.goals.away} ${item.teams.away.name}`,
                date: item.fixture.date.split('T')[0]
            }));
        }
    }

    const updatedMeta = {
        ...currentMeta,
        lineup_home,
        lineup_away,
        stats: mappedStats,
        events: mappedEvents,
        ai_prediction: mappedPrediction,
        h2h: mappedH2h
    };

    const { error: updateError } = await supabase
        .from('matches')
        .update({ metadata: updatedMeta })
        .eq('id', fixtureId.toString());

    if (updateError) {
        console.error(`  Failed to update details for fixture ${fixtureId}:`, updateError.message);
    } else {
        console.log(`  Successfully synced deep details (Lineups, Stats, Events, AI Prediction, H2H) for fixture ${fixtureId}.`);
    }
}

async function syncLeagues() {
    console.log('Starting Sync Process...');
    await authenticateAsAdmin();
    
    let totalMatchesSynced = 0;
    
    const leaguesToSync = leagueFilter 
        ? LEAGUES_TO_SYNC.filter(l => l.dbId === leagueFilter || l.id.toString() === leagueFilter)
        : LEAGUES_TO_SYNC;
        
    for (const league of leaguesToSync) {
        console.log(`\n=== SYNCING ${league.name.toUpperCase()} (ID: ${league.id}, Season: ${league.season}) ===`);
        
        // 0. Ensure league entry exists in DB to prevent foreign key constraint issues
        if (syncAllData) {
            const { error: leagueUpsertError } = await supabase
                .from('leagues')
                .upsert({
                    id: league.dbId,
                    api_id: league.id,
                    name: league.name,
                    is_active: true
                }, { onConflict: 'id' });
                
            if (leagueUpsertError) {
                console.error(`Failed to upsert league entry for ${league.name}:`, leagueUpsertError.message);
            } else {
                console.log(`League entry verified/upserted for ${league.dbId}.`);
            }
        }

        // 1. Sync Teams & League-Team relationships (Only if --all or --init flag is present)
        if (syncAllData) {
            console.log(`Syncing Teams for ${league.name}...`);
            const teams = await fetchFromApi('teams', { league: league.id, season: league.season });
            
            if (teams && teams.length > 0) {
                const teamsToSync = teams.map(item => ({
                    id: item.team.id,
                    name: item.team.name,
                    short_name: item.team.code || item.team.name.substring(0, 3).toUpperCase(),
                    logo: item.team.logo,
                    founded: item.team.founded || 1900,
                    stadium_name: item.venue.name || 'Estadio',
                    metadata: {
                        city: item.venue.city,
                        capacity: item.venue.capacity,
                        address: item.venue.address
                    },
                    updated_at: new Date().toISOString()
                }));
                
                // Upsert Teams
                const { error: teamError } = await supabase
                    .from('teams')
                    .upsert(teamsToSync, { onConflict: 'id' });
                    
                if (teamError) {
                    console.error(`Failed to upsert teams for ${league.name}:`, teamError.message);
                } else {
                    console.log(`Successfully synced ${teamsToSync.length} teams.`);
                    
                    // Upsert relations
                    const relations = teamsToSync.map(t => ({
                        league_id: league.dbId,
                        team_id: t.id,
                        season: league.season
                    }));
                    
                    const { error: relError } = await supabase
                        .from('league_teams')
                        .upsert(relations, { onConflict: 'league_id, team_id, season' });
                        
                    if (relError) {
                        console.error(`Failed to upsert league-team relations for ${league.name}:`, relError.message);
                    } else {
                        console.log(`Successfully associated teams with league ${league.dbId}.`);
                    }
                }
            }
            await new Promise(r => setTimeout(r, 1000)); // Sleep to respect rate limit
        }
        
        // 2. Sync Standings (Only if --all or --init flag is present)
        if (syncAllData) {
            console.log(`Syncing Standings for ${league.name}...`);
            const standings = await fetchFromApi('standings', { league: league.id, season: league.season });
            
            if (standings && standings.length > 0 && standings[0].league?.standings) {
                // Standings might be an array of arrays (e.g. groups). Let's flatten them.
                const standingsGroups = standings[0].league.standings;
                const flatStandings = standingsGroups.flat();
                
                const standingsToSync = flatStandings.map(s => ({
                    league_id: league.dbId,
                    season: league.season,
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
                
                // Filter out duplicate teams to prevent postgres ON CONFLICT error
                const seenTeams = new Set();
                const uniqueStandingsToSync = standingsToSync.filter(s => {
                    if (seenTeams.has(s.team_id)) {
                        return false;
                    }
                    seenTeams.add(s.team_id);
                    return true;
                });
                
                const { error: standingsError } = await supabase
                    .from('standings')
                    .upsert(uniqueStandingsToSync, { onConflict: 'league_id, season, team_id' });
                    
                if (standingsError) {
                    console.error(`Failed to upsert standings for ${league.name}:`, standingsError.message);
                } else {
                    console.log(`Successfully synced standings table (${uniqueStandingsToSync.length} entries).`);
                }
            }
            await new Promise(r => setTimeout(r, 1000)); // Sleep to respect rate limit
        }
        
        // 3. Sync Fixtures/Matches (Always)
        console.log(`Syncing Fixtures for ${league.name}...`);
        const fixtures = await fetchFromApi('fixtures', { league: league.id, season: league.season });
        
        if (fixtures && fixtures.length > 0) {
            const matchesToSync = fixtures
                .filter(f => {
                    // Filter out Clausura matches for LPF (league 128) because they are unconfirmed placeholders
                    if (league.id === 128 && f.league?.round && f.league.round.toLowerCase().includes('clausura')) {
                        return false;
                    }
                    return true;
                })
                .map(f => ({
                    id: f.fixture.id.toString(),
                    league_id: league.dbId, // Use dbId (e.g., 'lpf') not numeric API id
                    season: league.season,
                    home_team: f.teams.home.name,
                    home_team_logo: f.teams.home.logo,
                    away_team: f.teams.away.name,
                    away_team_logo: f.teams.away.logo,
                    start_time: f.fixture.date,
                    status: mapStatus(f.fixture.status.short),
                    home_score: f.goals.home,
                    away_score: f.goals.away,
                    metadata: {
                        referee: f.fixture.referee,
                        stadium: f.fixture.venue.name,
                        city: f.fixture.venue.city,
                        round: f.league.round,
                        home_id: f.teams.home.id,
                        away_id: f.teams.away.id,
                        home_winner: f.teams.home.winner,
                        away_winner: f.teams.away.winner,
                        penalty_home: f.score?.penalty?.home,
                        penalty_away: f.score?.penalty?.away
                    },
                    updated_at: new Date().toISOString()
                }));
            
            // Insert in batches of 100 to avoid request too large errors
            const BATCH_SIZE = 100;
            let leagueUpsertedCount = 0;
            for (let i = 0; i < matchesToSync.length; i += BATCH_SIZE) {
                const batch = matchesToSync.slice(i, i + BATCH_SIZE);
                const { error: matchError } = await supabase
                    .from('matches')
                    .upsert(batch, { onConflict: 'id' });
                    
                if (matchError) {
                    console.error(`Failed to upsert fixtures batch for ${league.name}:`, matchError.message);
                } else {
                    leagueUpsertedCount += batch.length;
                }
            }
            console.log(`Successfully synced ${leagueUpsertedCount} matches.`);
            totalMatchesSynced += leagueUpsertedCount;

            // 4. Fetch details for recently finished or live matches that lack them
            console.log(`Checking for matches without details for ${league.name}...`);
            const { data: matchesWithoutDetails, error: checkError } = await supabase
                .from('matches')
                .select('id')
                .eq('league_id', league.dbId)
                .in('status', ['FINISHED', 'LIVE'])
                .order('start_time', { ascending: false })
                .limit(20);

            if (checkError) {
                console.error(`Failed to check matches for ${league.name}:`, checkError.message);
            } else if (matchesWithoutDetails && matchesWithoutDetails.length > 0) {
                // Fetch full rows to check metadata programmatically
                const { data: fullMatches } = await supabase
                    .from('matches')
                    .select('id, metadata, start_time')
                    .in('id', matchesWithoutDetails.map(m => m.id))
                    .order('start_time', { ascending: false });
                
                const targets = (fullMatches || [])
                    .filter(m => !m.metadata?.events || !m.metadata?.stats || !m.metadata?.lineup_home)
                    .slice(0, 5); // Limit to 5 fixtures per league per run to avoid rate limits
                
                if (targets.length > 0) {
                    console.log(`Found ${targets.length} matches lacking deep details. Syncing...`);
                    for (const target of targets) {
                        await syncFixtureDetails(parseInt(target.id));
                    }
                } else {
                    console.log(`All finished/live matches for ${league.name} have deep details synced.`);
                }
            }

            // 5. Sync Top Performers (Goals & Assists) for active leagues
            if (syncAllData) {
                await syncTopPerformers(league.id, league.season, league.dbId);
            }
        }
        
        // Sleep to respect rate limit
        await new Promise(r => setTimeout(r, 1000));
    }
    
    console.log(`\nSync Complete! Total matches synced: ${totalMatchesSynced}`);
    process.exit(0);
}

async function syncTopPerformers(leagueApiId, season, dbLeagueId) {
    console.log(`\n=== SYNCING TOP PERFORMERS FOR ${dbLeagueId} (Season: ${season}) ===`);
    
    // Fetch Top Scorers
    console.log('  Fetching Top Scorers...');
    const scorers = await fetchFromApi('players/topscorers', { league: leagueApiId, season });
    await new Promise(r => setTimeout(r, 500));
    
    // Fetch Top Assists
    console.log('  Fetching Top Assists...');
    const assists = await fetchFromApi('players/topassists', { league: leagueApiId, season });
    await new Promise(r => setTimeout(r, 500));
    
    const performersToSync = [];
    
    if (scorers && scorers.length > 0) {
        scorers.slice(0, 10).forEach((item, idx) => {
            performersToSync.push({
                league_id: dbLeagueId,
                season: season,
                type: 'GOALS',
                rank: idx + 1,
                player_id: item.player.id.toString(),
                player_name: item.player.name,
                player_photo: item.player.photo,
                team_name: item.statistics[0].team.name,
                team_logo: item.statistics[0].team.logo,
                value: item.statistics[0].goals.total || 0,
                updated_at: new Date().toISOString()
            });
        });
    }
    
    if (assists && assists.length > 0) {
        assists.slice(0, 10).forEach((item, idx) => {
            performersToSync.push({
                league_id: dbLeagueId,
                season: season,
                type: 'ASSISTS',
                rank: idx + 1,
                player_id: item.player.id.toString(),
                player_name: item.player.name,
                player_photo: item.player.photo,
                team_name: item.statistics[0].team.name,
                team_logo: item.statistics[0].team.logo,
                value: item.statistics[0].goals.assists || 0,
                updated_at: new Date().toISOString()
            });
        });
    }
    
    if (performersToSync.length > 0) {
        console.log(`  Clearing old top performers for league ${dbLeagueId} season ${season}...`);
        await supabase
            .from('top_performers')
            .delete()
            .eq('league_id', dbLeagueId)
            .eq('season', season);
            
        console.log(`  Upserting ${performersToSync.length} top performers...`);
        const { error } = await supabase
            .from('top_performers')
            .upsert(performersToSync, { onConflict: 'league_id, season, type, player_id' });
            
        if (error) {
            console.error('  Failed to upsert top performers:', error.message);
        } else {
            console.log('  Top performers synced successfully.');
        }
    } else {
        console.log('  No top performers found to sync.');
    }
}

syncLeagues();
