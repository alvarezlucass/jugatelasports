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

// List of important national teams to sync (Argentina = 26, Brazil = 6, France = 67, etc.)
const TEAMS_TO_SYNC = [26, 6, 67, 10, 9, 2];

async function authenticateAsAdmin() {
    console.log('Authenticating as admin...');
    const { error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });
    if (error) {
        console.error('Failed to authenticate as admin:', error.message);
    } else {
        console.log('Successfully authenticated as Admin.');
    }
}

async function fetchSquad(teamId) {
    const url = `${API_URL}/players/squads?team=${teamId}`;
    console.log(`Fetching squad for Team ID ${teamId}...`);
    
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
            console.error(`API Error for team ${teamId}:`, json.errors);
            return { teamInfo: null, players: [] };
        }
        
        const teamInfo = json.response?.[0]?.team || null;
        const players = json.response?.[0]?.players || [];
        return { teamInfo, players };
    } catch (error) {
        console.error(`Request failed for team ${teamId}:`, error);
        return { teamInfo: null, players: [] };
    }
}

async function syncAll() {
    console.log('Starting Squad Sync Process...');
    await authenticateAsAdmin();
    
    let totalPlayersUpserted = 0;

    for (const teamId of TEAMS_TO_SYNC) {
        const { teamInfo, players } = await fetchSquad(teamId);
        
        if (!players || players.length === 0 || !teamInfo) {
            console.log(`No players or team info found for team ${teamId}`);
            continue;
        }
        
        // Upsert team first to avoid foreign key error
        await supabase.from('teams').upsert({
            id: teamInfo.id,
            name: teamInfo.name,
            logo: teamInfo.logo,
            short_name: teamInfo.name.substring(0, 3).toUpperCase()
        }, { onConflict: 'id' });

        console.log(`Retrieved ${players.length} players from API for team ${teamInfo.name}`);

        // Map to DB schema according to leagueService.ts
        const playersToSync = players.map(p => ({
            id: p.id,
            team_id: teamId,
            name: p.name,
            age: p.age,
            number: p.number || 0, // Fallback if no number is provided
            position: p.position,
            photo: p.photo,
            updated_at: new Date().toISOString()
        }));

        const { error } = await supabase
            .from('players')
            .upsert(playersToSync, { onConflict: 'id' });
            
        if (error) {
            console.error(`Failed to upsert players for team ${teamId}:`, error.message);
        } else {
            console.log(`Successfully synced squad for team ${teamId}.`);
            totalPlayersUpserted += players.length;
        }
        
        // Sleep 1 second to respect rate limits
        await new Promise(r => setTimeout(r, 1000));
    }
    
    console.log(`\nSquad Sync Complete! Total players upserted: ${totalPlayersUpserted}`);
    process.exit(0);
}

syncAll();
