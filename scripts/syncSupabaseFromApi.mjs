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
    { id: 1, season: 2026, name: 'World Cup 2026' },
    { id: 128, season: 2024, name: 'Liga Profesional Argentina' }
];

async function authenticateAsAdmin() {
    console.log('Authenticating as admin...');
    const { data, error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });
    if (error) {
        console.error('Failed to authenticate as admin. Supabase RLS might block inserts if not logged in:', error.message);
        // We continue anyway, in case public inserts are allowed or we have service role
    } else {
        console.log('Successfully authenticated as Admin.');
    }
}

async function fetchFixtures(leagueId, season) {
    const url = `${API_URL}/fixtures?league=${leagueId}&season=${season}`;
    console.log(`Fetching fixtures for League ${leagueId} (${season})...`);
    
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
            console.error('API Error:', json.errors);
            return [];
        }
        
        return json.response || [];
    } catch (error) {
        console.error('Request failed:', error);
        return [];
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

async function syncAll() {
    console.log('Starting Sync Process...');
    await authenticateAsAdmin();
    
    let totalUpserted = 0;

    for (const league of LEAGUES_TO_SYNC) {
        const fixtures = await fetchFixtures(league.id, league.season);
        console.log(`Retrieved ${fixtures.length} matches from API for ${league.name}`);
        
        if (fixtures.length === 0) continue;

        // Map to DB schema
        const matchesToSync = fixtures.map(f => ({
            id: f.fixture.id.toString(),
            league_id: league.id.toString(),
            season: league.season,
            home_team: f.teams.home.name,
            home_team_logo: f.teams.home.logo,
            away_team: f.teams.away.name,
            away_team_logo: f.teams.away.logo,
            start_time: f.fixture.date,
            status: mapStatus(f.fixture.status.short),
            home_score: f.goals.home || 0,
            away_score: f.goals.away || 0,
            metadata: {
                referee: f.fixture.referee,
                stadium: f.fixture.venue.name,
                city: f.fixture.venue.city,
                round: f.league.round
            },
            updated_at: new Date().toISOString()
        }));

        // Insert in batches of 100 to avoid request too large errors
        const BATCH_SIZE = 100;
        for (let i = 0; i < matchesToSync.length; i += BATCH_SIZE) {
            const batch = matchesToSync.slice(i, i + BATCH_SIZE);
            const { error } = await supabase
                .from('matches')
                .upsert(batch, { onConflict: 'id' });
                
            if (error) {
                console.error(`Failed to upsert batch for ${league.name}:`, error.message);
            } else {
                totalUpserted += batch.length;
            }
        }
        
        console.log(`Synced ${league.name} successfully.`);
        // Sleep 1 second to respect rate limits if more leagues are added
        await new Promise(r => setTimeout(r, 1000));
    }
    
    console.log(`\nSync Complete! Total matches upserted: ${totalUpserted}`);
    process.exit(0);
}

syncAll();
