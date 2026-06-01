import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_KEY = process.env.VITE_API_FOOTBALL_KEY;
const API_URL = 'https://v3.football.api-sports.io';

if (!API_KEY) {
    console.error('Missing key');
    process.exit(1);
}

async function run() {
    const fixtureId = '1544371';
    console.log(`Fetching fixture ${fixtureId} from API-Football...`);
    
    const response = await fetch(`${API_URL}/fixtures?id=${fixtureId}`, {
        method: 'GET',
        headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': API_KEY
        }
    });
    
    const json = await response.json();
    console.log('Result:', JSON.stringify(json, null, 2));
    process.exit(0);
}

run();
