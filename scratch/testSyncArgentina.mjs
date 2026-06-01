import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_KEY = process.env.VITE_API_FOOTBALL_KEY;
const API_URL = process.env.VITE_API_FOOTBALL_URL || 'https://v3.football.api-sports.io';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const headers = {
    'x-rapidapi-host': 'v3.football.api-sports.io',
    'x-rapidapi-key': API_KEY
};

async function main() {
    console.log('Fetching Argentina squad from API...');
    const res = await fetch(`${API_URL}/players/squads?team=26`, { headers });
    const json = await res.json();
    const players = json.response?.[0]?.players || [];
    
    console.log(`API returned ${players.length} players for Argentina.`);
    
    // Authenticate as admin to insert
    const { error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@jugatelasports.com',
        password: '@Marte2026',
    });
    if (authError) {
        console.error('Auth error:', authError.message);
        process.exit(1);
    }
    
    const playersToSync = players.map(p => ({
        id: p.id,
        team_id: 26,
        name: p.name,
        age: p.age,
        number: p.number || null,
        position: p.position,
        photo: p.photo,
        updated_at: new Date().toISOString()
    }));

    console.log('Players to upsert:', playersToSync.map(p => `${p.name} (ID: ${p.id})`));

    const { data, error } = await supabase
        .from('players')
        .upsert(playersToSync, { onConflict: 'id' })
        .select();
        
    if (error) {
        console.error('Upsert failed:', error.message);
    } else {
        console.log(`Upsert successful! Mapped rows returned: ${data.length}`);
    }
    
    process.exit(0);
}

main();
