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

async function fetchFromApi(endpoint) {
    const url = `${API_URL}/${endpoint}`;
    console.log(`Fetching from API: ${url}`);
    const res = await fetch(url, { headers });
    const json = await res.json();
    return json.response || [];
}

async function main() {
    const fixtureId = 1545443; // River Plate vs Belgrano Cordoba
    
    console.log(`=== Fetching Details for Fixture ${fixtureId} ===`);
    
    // 1. Lineups
    const lineups = await fetchFromApi(`fixtures/lineups?fixture=${fixtureId}`);
    console.log('\n--- LINEUPS ---');
    console.log(JSON.stringify(lineups, null, 2).substring(0, 1000) + '...\n');
    
    // 2. Statistics
    const stats = await fetchFromApi(`fixtures/statistics?fixture=${fixtureId}`);
    console.log('\n--- STATISTICS ---');
    console.log(JSON.stringify(stats, null, 2).substring(0, 1000) + '...\n');
    
    // 3. Events
    const events = await fetchFromApi(`fixtures/events?fixture=${fixtureId}`);
    console.log('\n--- EVENTS ---');
    console.log(JSON.stringify(events, null, 2).substring(0, 1000) + '...\n');
    
    process.exit(0);
}

main();
