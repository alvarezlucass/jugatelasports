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

async function main() {
    await authenticateAsAdmin();
    
    // 1. Get all team IDs associated with world-cup-2026
    console.log('Fetching World Cup team IDs from league_teams...');
    const { data: wcRelations, error: relError } = await supabase
        .from('league_teams')
        .select('team_id, teams(name)')
        .eq('league_id', 'world-cup-2026');
        
    if (relError) {
        console.error('Error fetching league relations:', relError.message);
        process.exit(1);
    }
    
    console.log(`Found ${wcRelations.length} World Cup teams.`);
    
    let totalPlayersSynced = 0;
    let totalCoachesSynced = 0;
    
    for (let i = 0; i < wcRelations.length; i++) {
        const rel = wcRelations[i];
        const teamId = rel.team_id;
        const teamName = rel.teams?.name || `Team ID ${teamId}`;
        
        console.log(`\n[${i + 1}/${wcRelations.length}] Syncing squad & coach for: ${teamName} (ID: ${teamId})...`);
        
        // A. Fetch squad/players
        console.log(`  -> Fetching squad...`);
        const squadRes = await fetchFromApi('players/squads', { team: teamId });
        
        if (squadRes && squadRes.length > 0 && squadRes[0].players) {
            const players = squadRes[0].players;
            const playersToSync = players.map(p => ({
                id: p.id,
                team_id: teamId,
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
                console.error(`  Failed to upsert players:`, playErr.message);
            } else {
                console.log(`  Successfully synced ${playersToSync.length} players.`);
                totalPlayersSynced += playersToSync.length;
            }
        } else {
            console.log(`  No squad found for ${teamName}.`);
        }
        
        await new Promise(r => setTimeout(r, 400)); // Delay between requests
        
        // B. Fetch coach
        console.log(`  -> Fetching coach...`);
        const coachRes = await fetchFromApi('coachs', { team: teamId });
        
        if (coachRes && coachRes.length > 0) {
            const coachesToSync = coachRes.map(c => ({
                id: c.id,
                team_id: teamId,
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
                console.error(`  Failed to upsert coaches:`, coachErr.message);
            } else {
                console.log(`  Successfully synced ${coachesToSync.length} coaches.`);
                totalCoachesSynced += coachesToSync.length;
            }
        } else {
            console.log(`  No coach found for ${teamName}.`);
        }
        
        // Pause to respect API rate limits
        await new Promise(r => setTimeout(r, 600));
    }
    
    console.log(`\nSync complete!`);
    console.log(`Total players synced: ${totalPlayersSynced}`);
    console.log(`Total coaches synced: ${totalCoachesSynced}`);
    process.exit(0);
}

main();
