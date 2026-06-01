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

async function authenticateAsAdmin() {
    console.log('Authenticating as admin...');
    const { error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });
    if (error) {
        console.error('Failed to authenticate as admin:', error.message);
        process.exit(1);
    }
    console.log('Authenticated as Admin.');
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

async function syncDeepData() {
    await authenticateAsAdmin();
    
    // 1. Fetch all teams from the database
    console.log('Fetching teams from Supabase...');
    const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name');
        
    if (teamsError) {
        console.error('Failed to fetch teams:', teamsError.message);
        process.exit(1);
    }
    
    console.log(`Found ${teams.length} teams in the database.`);
    
    let teamsSynced = 0;
    
    for (const team of teams) {
        teamsSynced++;
        console.log(`\n[${teamsSynced}/${teams.length}] Syncing deep data for team: ${team.name} (ID: ${team.id})`);
        
        // A. Sync Squad/Players
        console.log(` -> Fetching squad...`);
        const squadRes = await fetchFromApi('players/squads', { team: team.id });
        
        if (squadRes && squadRes.length > 0 && squadRes[0].players) {
            const players = squadRes[0].players;
            const playersToSync = players.map(p => ({
                id: p.id,
                team_id: team.id,
                name: p.name,
                age: p.age,
                number: p.number || null,
                position: p.position,
                photo: p.photo,
                updated_at: new Date().toISOString()
            }));
            
            const { error: playErr } = await supabase
                .from('players')
                .upsert(playersToSync, { onConflict: 'id' });
                
            if (playErr) {
                console.error(`  Failed to upsert players for ${team.name}:`, playErr.message);
            } else {
                console.log(`  Synced ${playersToSync.length} players.`);
            }
        }
        await new Promise(r => setTimeout(r, 600)); // Respect rate limits
        
        // B. Sync Coaches
        console.log(` -> Fetching coach...`);
        const coachRes = await fetchFromApi('coachs', { team: team.id });
        
        if (coachRes && coachRes.length > 0) {
            const coachesToSync = coachRes.map(c => ({
                id: c.id,
                team_id: team.id,
                name: c.name,
                age: c.age,
                photo: c.photo,
                nationality: c.nationality,
                updated_at: new Date().toISOString()
            }));
            
            const { error: coachErr } = await supabase
                .from('coaches')
                .upsert(coachesToSync, { onConflict: 'id' });
                
            if (coachErr) {
                console.error(`  Failed to upsert coaches for ${team.name}:`, coachErr.message);
            } else {
                console.log(`  Synced ${coachesToSync.length} coaches.`);
            }
        }
        
        // Pause between teams to avoid aggressive API hit
        await new Promise(r => setTimeout(r, 1000));
    }
    
    console.log('\nDeep Data Sync Complete for all teams!');
    process.exit(0);
}

syncDeepData();
