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
    console.log('Fetching Argentina squad from API-Football (team=26)...');
    const res = await fetch(`${API_URL}/players/squads?team=26`, { headers });
    const json = await res.json();
    const players = json.response?.[0]?.players || [];
    
    console.log(`API returned ${players.length} players for Argentina:`);
    players.forEach(p => {
        console.log(`- [${p.id}] #${p.number} ${p.name} (${p.position})`);
    });
    
    process.exit(0);
}

main();
