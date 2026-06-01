import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_KEY = process.env.VITE_API_FOOTBALL_KEY;
const API_URL = process.env.VITE_API_FOOTBALL_URL || 'https://v3.football.api-sports.io';

const headers = {
    'x-rapidapi-host': 'v3.football.api-sports.io',
    'x-rapidapi-key': API_KEY
};

async function main() {
    console.log('Querying API-Football for Argentina team 26 squad...');
    
    // 1. Check `/players/squads?team=26` (no season)
    const res1 = await fetch(`${API_URL}/players/squads?team=26`, { headers });
    const data1 = await res1.json();
    const squad1 = data1.response?.[0]?.players || [];
    console.log(`Squad without season parameter: Found ${squad1.length} players.`);
    
    const emi1 = squad1.find(p => p.name.toLowerCase().includes('martinez') || p.name.toLowerCase().includes('emiliano'));
    console.log('Emi Martinez found?', emi1);

    // Let's print the goalkeepers
    const gks = squad1.filter(p => p.position === 'Goalkeeper');
    console.log('Goalkeepers in squad (default):', gks);

    // 2. What about `/players?team=26&season=2024` or 2025?
    // Note: /players/squads doesn't take season. But /players?team=26&season=2024 does!
    // Let's check /players?team=26&season=2024
    console.log('\nQuerying /players?team=26&season=2024...');
    const res2 = await fetch(`${API_URL}/players?team=26&season=2024`, { headers });
    const data2 = await res2.json();
    const squad2 = data2.response || [];
    console.log(`Players in 2024 season: Found ${squad2.length} players.`);
    const emi2 = squad2.find(item => item.player.name.toLowerCase().includes('martinez') || item.player.name.toLowerCase().includes('emiliano'));
    if (emi2) {
        console.log('Emi Martinez found in 2024 season:', emi2.player.name, 'ID:', emi2.player.id);
    } else {
        console.log('Emi Martinez NOT found in 2024 season.');
    }
    
    process.exit(0);
}

main();
