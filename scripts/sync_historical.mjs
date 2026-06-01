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

const LEAGUES_TO_SYNC = [
    { id: 128, dbId: 'lpf', name: 'Liga Profesional Argentina' },
    { id: 2, dbId: 'ucl', name: 'UEFA Champions League' },
    { id: 39, dbId: 'premier', name: 'Premier League' },
    { id: 13, dbId: 'libertadores', name: 'Copa Libertadores' },
    { id: 140, dbId: 'laliga', name: 'La Liga' },
    { id: 135, dbId: 'serie-a', name: 'Serie A (Italia)' },
    { id: 78, dbId: 'bundesliga', name: 'Bundesliga (Alemania)' }
];

const HISTORICAL_SEASONS = [2021, 2022, 2023, 2024]; // 2025/2026 are already covered in main sync

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
        case 'HT':
        case '2H':
        case 'ET':
        case 'BT':
        case 'P':
        case 'SUSP':
        case 'INT': return 'LIVE';
        case 'FT':
        case 'AET':
        case 'PEN': return 'FINISHED';
        case 'PST':
        case 'CANC':
        case 'ABD':
        case 'AWD':
        case 'WO': return 'POSTPONED';
        default: return 'UPCOMING';
    }
}

async function syncHistoricalFixtures() {
    console.log('Starting historical sync for 5 years...');
    
    for (const league of LEAGUES_TO_SYNC) {
        for (const season of HISTORICAL_SEASONS) {
            console.log(`Fetching ${league.name} - Season ${season}`);
            const fixtures = await fetchFromApi('fixtures', { league: league.id, season: season });
            
            if (!fixtures || fixtures.length === 0) {
                console.log(`No fixtures found for ${league.name} ${season}`);
                continue;
            }

            const matchRecords = fixtures.map(f => {
                const status = mapStatus(f.fixture.status.short);
                const isFinished = status === 'FINISHED';
                return {
                    id: f.fixture.id.toString(),
                    league_id: league.dbId,
                    season: season,
                    home_team: f.teams.home.name,
                    away_team: f.teams.away.name,
                    home_team_logo: f.teams.home.logo,
                    away_team_logo: f.teams.away.logo,
                    start_time: f.fixture.date,
                    status: status,
                    home_score: isFinished ? f.goals.home : null,
                    away_score: isFinished ? f.goals.away : null,
                    metadata: {
                        home_id: f.teams.home.id,
                        away_id: f.teams.away.id,
                        round: f.league.round,
                        stadium: f.fixture.venue.name,
                        city: f.fixture.venue.city
                    },
                    updated_at: new Date().toISOString()
                };
            });

            // Upsert in batches of 100
            for (let i = 0; i < matchRecords.length; i += 100) {
                const batch = matchRecords.slice(i, i + 100);
                const { error } = await supabase.from('matches').upsert(batch, { onConflict: 'id' });
                if (error) {
                    console.error(`Error saving batch for ${league.name} ${season}:`, error);
                }
            }
            
            console.log(`Saved ${matchRecords.length} historical matches for ${league.name} ${season}`);
            // Sleep to avoid rate limits
            await new Promise(r => setTimeout(r, 500));
        }
    }
    console.log('Historical sync completed!');
}

syncHistoricalFixtures().catch(console.error);
