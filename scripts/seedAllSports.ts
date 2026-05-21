import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing required environment variables VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_EMAIL = 'admin@jugatelasports.com';
const ADMIN_PASSWORD = '@Marte2026';

async function authenticateAsAdmin() {
    console.log('Authenticating as admin...');
    const { data, error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });
    if (error) {
        console.error('Failed to authenticate as admin. Seeding might fail if RLS is active:', error.message);
    } else {
        console.log('Successfully authenticated as Admin.');
    }
}

// -------------------------------------------------------------------------
// DATA CONFIGURATIONS
// -------------------------------------------------------------------------

const SEASON = 2026;

// --- LEAGUES TO SEED ---
const leaguesToSeed = [
    { id: 'ucl', api_id: 2, name: 'UEFA Champions League', country: 'Europa', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Coupe_des_clubs_champions_europ%C3%A9ens.png/800px-Coupe_des_clubs_champions_europ%C3%A9ens.png' },
    { id: 'premier', api_id: 39, name: 'Premier League', country: 'Inglaterra', logo: 'https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg' },
    { id: 'libertadores', api_id: 13, name: 'Copa Libertadores', country: 'Sudamérica', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Copa_Libertadores.png/800px-Copa_Libertadores.png' },
    { id: 'laliga', api_id: 140, name: 'La Liga', country: 'España', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/LaLiga_logo_2023.svg/800px-LaLiga_logo_2023.svg.png' },
    { id: 'nba', api_id: 99991, name: 'NBA', country: 'EE.UU.', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8f/Boston_Celtics.svg/800px-Boston_Celtics.svg.png' },
    { id: 'tennis', api_id: 99992, name: 'Grand Slams Tenis', country: 'Global', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Tennis_ball_3.svg/800px-Tennis_ball_3.svg.png' },
    { id: 'f1', api_id: 99993, name: 'Fórmula 1', country: 'Global', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Red_Bull_Racing_logo.svg/800px-Red_Bull_Racing_logo.svg.png' },
];

// --- UCL TEAMS ---
const uclTeams = [
    { id: 501, name: 'Real Madrid', short_name: 'RMA', logo: 'https://media.api-sports.io/football/teams/541.png', metadata: {} },
    { id: 502, name: 'Manchester City', short_name: 'MCI', logo: 'https://media.api-sports.io/football/teams/50.png', metadata: {} },
    { id: 503, name: 'Bayern Munich', short_name: 'FCB', logo: 'https://media.api-sports.io/football/teams/157.png', metadata: {} },
    { id: 504, name: 'Paris Saint Germain', short_name: 'PSG', logo: 'https://media.api-sports.io/football/teams/85.png', metadata: {} },
    { id: 505, name: 'Arsenal FC', short_name: 'ARS', logo: 'https://media.api-sports.io/football/teams/42.png', metadata: {} },
    { id: 506, name: 'FC Barcelona', short_name: 'BAR', logo: 'https://media.api-sports.io/football/teams/529.png', metadata: {} },
    { id: 507, name: 'Inter Milan', short_name: 'INT', logo: 'https://media.api-sports.io/football/teams/505.png', metadata: {} },
    { id: 508, name: 'Atletico Madrid', short_name: 'ATM', logo: 'https://media.api-sports.io/football/teams/530.png', metadata: {} },
];

// --- PREMIER LEAGUE TEAMS ---
const premierTeams = [
    { id: 601, name: 'Manchester City', short_name: 'MCI', logo: 'https://media.api-sports.io/football/teams/50.png', metadata: {} },
    { id: 602, name: 'Arsenal FC', short_name: 'ARS', logo: 'https://media.api-sports.io/football/teams/42.png', metadata: {} },
    { id: 603, name: 'Liverpool FC', short_name: 'LIV', logo: 'https://media.api-sports.io/football/teams/40.png', metadata: {} },
    { id: 604, name: 'Aston Villa', short_name: 'AVL', logo: 'https://media.api-sports.io/football/teams/66.png', metadata: {} },
    { id: 605, name: 'Tottenham Hotspur', short_name: 'TOT', logo: 'https://media.api-sports.io/football/teams/47.png', metadata: {} },
    { id: 606, name: 'Chelsea FC', short_name: 'CHE', logo: 'https://media.api-sports.io/football/teams/49.png', metadata: {} },
    { id: 607, name: 'Manchester United', short_name: 'MUN', logo: 'https://media.api-sports.io/football/teams/33.png', metadata: {} },
    { id: 608, name: 'Newcastle United', short_name: 'NEW', logo: 'https://media.api-sports.io/football/teams/34.png', metadata: {} },
];

// --- LA LIGA TEAMS ---
const laligaTeams = [
    { id: 701, name: 'Real Madrid', short_name: 'RMA', logo: 'https://media.api-sports.io/football/teams/541.png', metadata: {} },
    { id: 702, name: 'FC Barcelona', short_name: 'BAR', logo: 'https://media.api-sports.io/football/teams/529.png', metadata: {} },
    { id: 703, name: 'Girona FC', short_name: 'GIR', logo: 'https://media.api-sports.io/football/teams/987.png', metadata: {} },
    { id: 704, name: 'Atletico Madrid', short_name: 'ATM', logo: 'https://media.api-sports.io/football/teams/530.png', metadata: {} },
    { id: 705, name: 'Athletic Bilbao', short_name: 'ATH', logo: 'https://media.api-sports.io/football/teams/531.png', metadata: {} },
    { id: 706, name: 'Real Sociedad', short_name: 'RSO', logo: 'https://media.api-sports.io/football/teams/548.png', metadata: {} },
    { id: 707, name: 'Real Betis', short_name: 'BET', logo: 'https://media.api-sports.io/football/teams/543.png', metadata: {} },
    { id: 708, name: 'Villarreal CF', short_name: 'VIL', logo: 'https://media.api-sports.io/football/teams/533.png', metadata: {} },
];

// --- LIBERTADORES TEAMS ---
const libertadoresTeams = [
    { id: 801, name: 'River Plate', short_name: 'CARP', logo: 'https://media.api-sports.io/football/teams/435.png', metadata: {} },
    { id: 802, name: 'Palmeiras', short_name: 'PAL', logo: 'https://media.api-sports.io/football/teams/121.png', metadata: {} },
    { id: 803, name: 'Flamengo', short_name: 'FLA', logo: 'https://media.api-sports.io/football/teams/127.png', metadata: {} },
    { id: 804, name: 'Fluminense', short_name: 'FLU', logo: 'https://media.api-sports.io/football/teams/124.png', metadata: {} },
    { id: 805, name: 'Boca Juniors', short_name: 'CABJ', logo: 'https://media.api-sports.io/football/teams/451.png', metadata: {} },
    { id: 806, name: 'Atletico Mineiro', short_name: 'CAM', logo: 'https://media.api-sports.io/football/teams/130.png', metadata: {} },
    { id: 807, name: 'Sao Paulo FC', short_name: 'SAO', logo: 'https://media.api-sports.io/football/teams/126.png', metadata: {} },
    { id: 808, name: 'Colo Colo', short_name: 'COL', logo: 'https://media.api-sports.io/football/teams/1148.png', metadata: {} },
];

// --- NBA TEAMS ---
const nbaTeams = [
    // East
    { id: 901, name: 'Boston Celtics', short_name: 'BOS', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8f/Boston_Celtics.svg/800px-Boston_Celtics.svg.png', metadata: { conference: 'east' } },
    { id: 902, name: 'Milwaukee Bucks', short_name: 'MIL', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/Milwaukee_Bucks_logo.svg/800px-Milwaukee_Bucks_logo.svg.png', metadata: { conference: 'east' } },
    { id: 903, name: 'New York Knicks', short_name: 'NYK', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/25/New_York_Knicks_logo.svg/800px-New_York_Knicks_logo.svg.png', metadata: { conference: 'east' } },
    { id: 904, name: 'Philadelphia 76ers', short_name: 'PHI', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Philadelphia_76ers_logo.svg/800px-Philadelphia_76ers_logo.svg.png', metadata: { conference: 'east' } },
    { id: 905, name: 'Miami Heat', short_name: 'MIA', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/Miami_Heat_logo.svg/800px-Miami_Heat_logo.svg.png', metadata: { conference: 'east' } },
    { id: 906, name: 'Cleveland Cavaliers', short_name: 'CLE', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Cleveland_Cavaliers_logo.svg/800px-Cleveland_Cavaliers_logo.svg.png', metadata: { conference: 'east' } },
    // West
    { id: 907, name: 'Denver Nuggets', short_name: 'DEN', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/76/Denver_Nuggets.svg/800px-Denver_Nuggets.svg.png', metadata: { conference: 'west' } },
    { id: 908, name: 'Oklahoma City Thunder', short_name: 'OKC', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5d/Oklahoma_City_Thunder.svg/800px-Oklahoma_City_Thunder.svg.png', metadata: { conference: 'west' } },
    { id: 909, name: 'Minnesota Timberwolves', short_name: 'MIN', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/Minnesota_Timberwolves_logo.svg/800px-Minnesota_Timberwolves_logo.svg.png', metadata: { conference: 'west' } },
    { id: 910, name: 'Los Angeles Clippers', short_name: 'LAC', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/LA_Clippers_logo_2024.svg/800px-LA_Clippers_logo_2024.svg.png', metadata: { conference: 'west' } },
    { id: 911, name: 'Dallas Mavericks', short_name: 'DAL', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/97/Dallas_Mavericks_logo.svg/800px-Dallas_Mavericks_logo.svg.png', metadata: { conference: 'west' } },
    { id: 912, name: 'Los Angeles Lakers', short_name: 'LAL', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Los_Angeles_Lakers_logo.svg/800px-Los_Angeles_Lakers_logo.svg.png', metadata: { conference: 'west' } },
];

// --- TENNIS PLAYERS ---
const tennisTeams = [
    // ATP
    { id: 1001, name: 'Jannik Sinner', short_name: 'SIN', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Flag_of_Italy.svg/800px-Flag_of_Italy.svg.png', metadata: { circuit: 'atp', country: 'ITA' } },
    { id: 1002, name: 'Carlos Alcaraz', short_name: 'ALC', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Spain.svg/800px-Flag_of_Spain.svg.png', metadata: { circuit: 'atp', country: 'ESP' } },
    { id: 1003, name: 'Novak Djokovic', short_name: 'DJO', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Flag_of_Serbia.svg/800px-Flag_of_Serbia.svg.png', metadata: { circuit: 'atp', country: 'SRB' } },
    { id: 1004, name: 'Daniil Medvedev', short_name: 'MED', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Tennis_ball_3.svg/800px-Tennis_ball_3.svg.png', metadata: { circuit: 'atp', country: 'INT' } },
    { id: 1005, name: 'Alexander Zverev', short_name: 'ZVE', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Flag_of_Germany.svg/800px-Flag_of_Germany.svg.png', metadata: { circuit: 'atp', country: 'GER' } },
    // WTA
    { id: 1006, name: 'Iga Swiatek', short_name: 'SWI', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Flag_of_Poland.svg/800px-Flag_of_Poland.svg.png', metadata: { circuit: 'wta', country: 'POL' } },
    { id: 1007, name: 'Aryna Sabalenka', short_name: 'SAB', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Tennis_ball_3.svg/800px-Tennis_ball_3.svg.png', metadata: { circuit: 'wta', country: 'INT' } },
    { id: 1008, name: 'Coco Gauff', short_name: 'GAU', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/800px-Flag_of_the_United_States.svg.png', metadata: { circuit: 'wta', country: 'USA' } },
    { id: 1009, name: 'Elena Rybakina', short_name: 'RYB', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Flag_of_Kazakhstan.svg/800px-Flag_of_Kazakhstan.svg.png', metadata: { circuit: 'wta', country: 'KAZ' } },
    { id: 1010, name: 'Jessica Pegula', short_name: 'PEG', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/800px-Flag_of_the_United_States.svg.png', metadata: { circuit: 'wta', country: 'USA' } },
];

// --- F1 DRIVERS ---
const f1Teams = [
    { id: 1101, name: 'Max Verstappen', short_name: 'VER', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Red_Bull_Racing_logo.svg/800px-Red_Bull_Racing_logo.svg.png', metadata: { constructor: 'Red Bull Racing' } },
    { id: 1102, name: 'Lando Norris', short_name: 'NOR', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/66/McLaren_Racing_logo.svg/800px-McLaren_Racing_logo.svg.png', metadata: { constructor: 'McLaren' } },
    { id: 1103, name: 'Charles Leclerc', short_name: 'LEC', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c0/Scuderia_Ferrari_Logo.svg/800px-Scuderia_Ferrari_Logo.svg.png', metadata: { constructor: 'Scuderia Ferrari' } },
    { id: 1104, name: 'Carlos Sainz', short_name: 'SAI', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c0/Scuderia_Ferrari_Logo.svg/800px-Scuderia_Ferrari_Logo.svg.png', metadata: { constructor: 'Scuderia Ferrari' } },
    { id: 1105, name: 'Oscar Piastri', short_name: 'PIA', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/66/McLaren_Racing_logo.svg/800px-McLaren_Racing_logo.svg.png', metadata: { constructor: 'McLaren' } },
    { id: 1106, name: 'Lewis Hamilton', short_name: 'HAM', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/21/Mercedes-Benz_Grand_Prix_logo.svg/800px-Mercedes-Benz_Grand_Prix_logo.svg.png', metadata: { constructor: 'Mercedes-AMG' } },
    { id: 1107, name: 'George Russell', short_name: 'RUS', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/21/Mercedes-Benz_Grand_Prix_logo.svg/800px-Mercedes-Benz_Grand_Prix_logo.svg.png', metadata: { constructor: 'Mercedes-AMG' } },
    { id: 1108, name: 'Sergio Perez', short_name: 'PER', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Red_Bull_Racing_logo.svg/800px-Red_Bull_Racing_logo.svg.png', metadata: { constructor: 'Red Bull Racing' } },
];

async function seedAll() {
    await authenticateAsAdmin();

    console.log('Upserting Leagues...');
    const { error: leaguesError } = await supabase.from('leagues').upsert(leaguesToSeed, { onConflict: 'id' });
    if (leaguesError) {
        console.error('Error inserting leagues:', leaguesError.message);
        process.exit(1);
    }

    console.log('Cleaning up previous standings & league relation items...');
    const targetLeagues = ['ucl', 'premier', 'libertadores', 'laliga', 'nba', 'tennis', 'f1'];
    await supabase.from('matches').delete().in('league_id', ['2', '39', '13', '140', 'nba', 'tennis', 'f1']);
    await supabase.from('standings').delete().in('league_id', targetLeagues);
    await supabase.from('league_teams').delete().in('league_id', targetLeagues);
    
    console.log('Seeding Teams...');
    const allMockTeams = [
        ...uclTeams,
        ...premierTeams,
        ...laligaTeams,
        ...libertadoresTeams,
        ...nbaTeams,
        ...tennisTeams,
        ...f1Teams
    ];

    // Remove duplicates by ID to avoid conflicts
    const uniqueTeams = Array.from(new Map(allMockTeams.map(t => [t.id, t])).values());

    const { error: teamsError } = await supabase.from('teams').upsert(
        uniqueTeams.map(t => ({
            id: t.id,
            name: t.name,
            short_name: t.short_name,
            logo: t.logo,
            founded: 1900,
            stadium_name: 'Estadio',
            metadata: t.metadata || {}
        })), { onConflict: 'id' }
    );
    if (teamsError) {
        console.error('Error inserting teams:', teamsError.message);
        process.exit(1);
    }

    // Seed relationships
    console.log('Seeding League Team relationships...');
    const relations: any[] = [];
    
    uclTeams.forEach(t => relations.push({ league_id: 'ucl', team_id: t.id, season: SEASON }));
    premierTeams.forEach(t => relations.push({ league_id: 'premier', team_id: t.id, season: SEASON }));
    laligaTeams.forEach(t => relations.push({ league_id: 'laliga', team_id: t.id, season: SEASON }));
    libertadoresTeams.forEach(t => relations.push({ league_id: 'libertadores', team_id: t.id, season: SEASON }));
    nbaTeams.forEach(t => relations.push({ league_id: 'nba', team_id: t.id, season: SEASON }));
    tennisTeams.forEach(t => relations.push({ league_id: 'tennis', team_id: t.id, season: SEASON }));
    f1Teams.forEach(t => relations.push({ league_id: 'f1', team_id: t.id, season: SEASON }));

    const { error: relError } = await supabase.from('league_teams').upsert(relations);
    if (relError) {
        console.error('Error inserting relations:', relError.message);
        process.exit(1);
    }

    // Seed Standings (Without invalid columns like metadata)
    console.log('Seeding Standings...');
    const standingsData: any[] = [];

    // UCL standings
    uclTeams.forEach((t, i) => {
        standingsData.push({
            league_id: 'ucl', season: SEASON, team_id: t.id, rank: i + 1,
            points: 24 - i * 3, played: 8, win: 8 - i, draw: 0, lose: i,
            goals_for: 20 - i, goals_against: 5 + i, form: 'WWWDW'.substring(i) || 'L'
        });
    });

    // Premier standings
    premierTeams.forEach((t, i) => {
        standingsData.push({
            league_id: 'premier', season: SEASON, team_id: t.id, rank: i + 1,
            points: 88 - i * 4, played: 38, win: 28 - i, draw: 4, lose: 6 + i,
            goals_for: 90 - i * 5, goals_against: 30 + i * 3, form: 'WWDLW'.substring(i % 3)
        });
    });

    // La Liga standings
    laligaTeams.forEach((t, i) => {
        standingsData.push({
            league_id: 'laliga', season: SEASON, team_id: t.id, rank: i + 1,
            points: 85 - i * 3, played: 38, win: 26 - i, draw: 7, lose: 5 + i,
            goals_for: 80 - i * 3, goals_against: 25 + i * 2, form: 'WWDWW'.substring(i % 2)
        });
    });

    // Libertadores standings
    libertadoresTeams.forEach((t, i) => {
        standingsData.push({
            league_id: 'libertadores', season: SEASON, team_id: t.id, rank: i + 1,
            points: 18 - i * 2, played: 6, win: 6 - i, draw: 0, lose: i,
            goals_for: 15 - i, goals_against: 3 + i, form: 'WWWLL'.substring(i % 3)
        });
    });

    // NBA standings
    nbaTeams.forEach((t, i) => {
        const rank = (i % 6) + 1;
        standingsData.push({
            league_id: 'nba', season: SEASON, team_id: t.id, rank: rank,
            points: 62 - rank * 3, played: 82, win: 62 - rank * 3, draw: 0, lose: 20 + rank * 3,
            goals_for: 9000, goals_against: 8500, form: rank === 1 ? 'W10' : 'L2'
        });
    });

    // Tennis rankings
    tennisTeams.forEach((t, i) => {
        const rank = (i % 5) + 1;
        standingsData.push({
            league_id: 'tennis', season: SEASON, team_id: t.id, rank: rank,
            points: 10000 - rank * 1200, played: 22, win: 85 - rank * 5, draw: 0, lose: rank * 5,
            goals_for: 0, goals_against: 0, form: 'W'
        });
    });

    // F1 driver standings
    f1Teams.forEach((t, i) => {
        standingsData.push({
            league_id: 'f1', season: SEASON, team_id: t.id, rank: i + 1,
            points: 400 - i * 45, played: 24, win: 15 - i * 2, draw: 0, lose: 0,
            goals_for: 0, goals_against: 0, form: i === 0 ? '1st' : '4th'
        });
    });

    const { error: standingsErr } = await supabase.from('standings').upsert(standingsData);
    if (standingsErr) {
        console.error('Error inserting standings:', standingsErr.message);
        process.exit(1);
    }

    // Seed Matches
    console.log('Seeding Matches...');
    const matchesData: any[] = [];
    const baseDate = new Date('2026-05-24T18:00:00Z'); // Sunday, May 24, 2026

    // 1. UCL fixtures
    matchesData.push({
        id: 'ucl-m1-2026', league_id: '2', season: SEASON,
        home_team: 'Real Madrid', home_team_logo: 'https://media.api-sports.io/football/teams/541.png',
        away_team: 'Manchester City', away_team_logo: 'https://media.api-sports.io/football/teams/50.png',
        start_time: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        status: 'UPCOMING', home_score: null, away_score: null,
        odds: { home: 2.3, draw: 3.4, away: 2.9 },
        metadata: { round: 'Semifinal - Ida', stadium: 'Estadio Santiago Bernabéu', city: 'Madrid, España' }
    });
    matchesData.push({
        id: 'ucl-m2-2026', league_id: '2', season: SEASON,
        home_team: 'Bayern Munich', home_team_logo: 'https://media.api-sports.io/football/teams/157.png',
        away_team: 'Paris Saint Germain', away_team_logo: 'https://media.api-sports.io/football/teams/85.png',
        start_time: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        status: 'UPCOMING', home_score: null, away_score: null,
        odds: { home: 2.0, draw: 3.6, away: 3.5 },
        metadata: { round: 'Semifinal - Ida', stadium: 'Allianz Arena', city: 'Múnich, Alemania' }
    });

    // 2. Premier League fixtures
    matchesData.push({
        id: 'prem-m1-2026', league_id: '39', season: SEASON,
        home_team: 'Liverpool FC', home_team_logo: 'https://media.api-sports.io/football/teams/40.png',
        away_team: 'Chelsea FC', away_team_logo: 'https://media.api-sports.io/football/teams/49.png',
        start_time: new Date(baseDate.getTime() + 6 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString(),
        status: 'UPCOMING', home_score: null, away_score: null,
        odds: { home: 1.8, draw: 3.8, away: 4.2 },
        metadata: { round: 'Fecha 37', stadium: 'Anfield', city: 'Liverpool, Inglaterra' }
    });
    matchesData.push({
        id: 'prem-m2-2026', league_id: '39', season: SEASON,
        home_team: 'Arsenal FC', home_team_logo: 'https://media.api-sports.io/football/teams/42.png',
        away_team: 'Manchester United', away_team_logo: 'https://media.api-sports.io/football/teams/33.png',
        start_time: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'UPCOMING', home_score: null, away_score: null,
        odds: { home: 1.65, draw: 4.0, away: 5.0 },
        metadata: { round: 'Fecha 37', stadium: 'Emirates Stadium', city: 'Londres, Inglaterra' }
    });

    // 3. La Liga fixtures
    matchesData.push({
        id: 'liga-m1-2026', league_id: '140', season: SEASON,
        home_team: 'FC Barcelona', home_team_logo: 'https://media.api-sports.io/football/teams/529.png',
        away_team: 'Real Madrid', away_team_logo: 'https://media.api-sports.io/football/teams/541.png',
        start_time: new Date(baseDate.getTime() + 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        status: 'UPCOMING', home_score: null, away_score: null,
        odds: { home: 2.4, draw: 3.5, away: 2.7 },
        metadata: { round: 'Fecha 36', stadium: 'Spotify Camp Nou', city: 'Barcelona, España' }
    });

    // 4. Libertadores fixtures
    matchesData.push({
        id: 'lib-m1-2026', league_id: '13', season: SEASON,
        home_team: 'Boca Juniors', home_team_logo: 'https://media.api-sports.io/football/teams/451.png',
        away_team: 'River Plate', away_team_logo: 'https://media.api-sports.io/football/teams/435.png',
        start_time: new Date(baseDate.getTime() + 4 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(),
        status: 'UPCOMING', home_score: null, away_score: null,
        odds: { home: 2.2, draw: 3.0, away: 3.1 },
        metadata: { round: 'Fase de Grupos - Fecha 5', stadium: 'La Bombonera', city: 'Buenos Aires, Argentina' }
    });

    // 5. NBA fixtures
    matchesData.push({
        id: 'nba-m1-2026', league_id: 'nba', season: SEASON,
        home_team: 'Los Angeles Lakers', home_team_logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Los_Angeles_Lakers_logo.svg/800px-Los_Angeles_Lakers_logo.svg.png',
        away_team: 'Boston Celtics', away_team_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8f/Boston_Celtics.svg/800px-Boston_Celtics.svg.png',
        start_time: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        status: 'UPCOMING', home_score: null, away_score: null,
        odds: { home: 2.1, draw: 12.0, away: 1.75 },
        metadata: { round: 'Finales de la NBA - Juego 1', stadium: 'Crypto.com Arena', city: 'Los Angeles, EE.UU.' }
    });
    matchesData.push({
        id: 'nba-m2-2026', league_id: 'nba', season: SEASON,
        home_team: 'Denver Nuggets', home_team_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/76/Denver_Nuggets.svg/800px-Denver_Nuggets.svg.png',
        away_team: 'New York Knicks', away_team_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/25/New_York_Knicks_logo.svg/800px-New_York_Knicks_logo.svg.png',
        start_time: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'UPCOMING', home_score: null, away_score: null,
        odds: { home: 1.5, draw: 13.0, away: 2.6 },
        metadata: { round: 'Temporada Regular', stadium: 'Ball Arena', city: 'Denver, EE.UU.' }
    });

    // 6. Tennis Grand Slam fixtures
    matchesData.push({
        id: 'tennis-m1-2026', league_id: 'tennis', season: SEASON,
        home_team: 'Jannik Sinner', home_team_logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Flag_of_Italy.svg/800px-Flag_of_Italy.svg.png',
        away_team: 'Carlos Alcaraz', away_team_logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Spain.svg/800px-Flag_of_Spain.svg.png',
        start_time: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'UPCOMING', home_score: null, away_score: null,
        odds: { home: 1.9, draw: 99.0, away: 1.9 },
        metadata: { round: 'Roland Garros - Semifinal', stadium: 'Court Philippe Chatrier', city: 'París, Francia' }
    });
    matchesData.push({
        id: 'tennis-m2-2026', league_id: 'tennis', season: SEASON,
        home_team: 'Iga Swiatek', home_team_logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Flag_of_Poland.svg/800px-Flag_of_Poland.svg.png',
        away_team: 'Aryna Sabalenka', away_team_logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Tennis_ball_3.svg/800px-Tennis_ball_3.svg.png',
        start_time: new Date(baseDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'UPCOMING', home_score: null, away_score: null,
        odds: { home: 1.6, draw: 99.0, away: 2.3 },
        metadata: { round: 'Roland Garros - Final Femenina', stadium: 'Court Philippe Chatrier', city: 'París, Francia' }
    });

    // 7. F1 fixtures
    matchesData.push({
        id: 'f1-h2h-1-2026', league_id: 'f1', season: SEASON,
        home_team: 'Max Verstappen', home_team_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Red_Bull_Racing_logo.svg/800px-Red_Bull_Racing_logo.svg.png',
        away_team: 'Lando Norris', away_team_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/66/McLaren_Racing_logo.svg/800px-McLaren_Racing_logo.svg.png',
        start_time: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
        status: 'UPCOMING', home_score: null, away_score: null,
        odds: { home: 1.65, draw: 99.0, away: 2.1 },
        metadata: { round: 'Carrera - GP de Mónaco', stadium: 'Circuito de Mónaco', city: 'Montecarlo, Mónaco', is_h2h: true }
    });
    matchesData.push({
        id: 'f1-h2h-2-2026', league_id: 'f1', season: SEASON,
        home_team: 'Charles Leclerc', home_team_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c0/Scuderia_Ferrari_Logo.svg/800px-Scuderia_Ferrari_Logo.svg.png',
        away_team: 'Lewis Hamilton', away_team_logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/21/Mercedes-Benz_Grand_Prix_logo.svg/800px-Mercedes-Benz_Grand_Prix_logo.svg.png',
        start_time: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
        status: 'UPCOMING', home_score: null, away_score: null,
        odds: { home: 1.85, draw: 99.0, away: 1.85 },
        metadata: { round: 'Carrera - GP de Mónaco', stadium: 'Circuito de Mónaco', city: 'Montecarlo, Mónaco', is_h2h: true }
    });

    const { error: matchesErr } = await supabase.from('matches').upsert(matchesData);
    if (matchesErr) {
        console.error('Error inserting matches:', matchesErr.message);
        process.exit(1);
    } else {
        console.log('Seeded matches successfully:', matchesData.length);
    }

    console.log('\nSeeding Complete for all Sports!');
    process.exit(0);
}

seedAll();
