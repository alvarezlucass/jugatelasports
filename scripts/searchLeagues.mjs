import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const API_KEY = process.env.VITE_API_FOOTBALL_KEY;
const API_URL = process.env.VITE_API_FOOTBALL_URL || 'https://v3.football.api-sports.io';

const headers = {
    'x-rapidapi-host': 'v3.football.api-sports.io',
    'x-rapidapi-key': API_KEY
};

async function checkLeague(id) {
    try {
        const response = await fetch(`${API_URL}/leagues?id=${id}`, { method: 'GET', headers });
        const json = await response.json();
        
        const seasons = json.response[0].seasons.map(s => s.year);
        console.log(`League ${id} seasons: ${seasons.join(', ')}`);

    } catch (error) {
        console.error("Failed:", error);
    }
}

checkLeague(34); // SA Qualifiers
checkLeague(1);  // World Cup
