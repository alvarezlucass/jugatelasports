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

async function fetchRoute(route) {
    console.log(`\n--- Fetching /${route} ---`);
    try {
        const response = await fetch(`${API_URL}/${route}`, { method: 'GET', headers });
        const json = await response.json();
        if (json.errors && Object.keys(json.errors).length > 0) {
            console.error('API Error:', json.errors);
        } else {
            console.log(JSON.stringify(json.response, null, 2).substring(0, 1000));
        }
    } catch (e) {
        console.error('Failed:', e);
    }
}

async function run() {
    await fetchRoute('leagues?id=128'); // Liga Profesional
    await fetchRoute('leagues?id=1'); // World Cup
    await fetchRoute('players/squads?team=26'); // Argentina squad (team id 26)
}

run();
