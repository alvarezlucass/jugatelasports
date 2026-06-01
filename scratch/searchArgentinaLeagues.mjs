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

async function search() {
    try {
        const response = await fetch(`${API_URL}/leagues?country=Argentina`, { method: 'GET', headers });
        const json = await response.json();
        
        const leagues = json.response.map(l => ({
            id: l.league.id,
            name: l.league.name,
            type: l.league.type,
            active_seasons: l.seasons.filter(s => s.current).map(s => s.year)
        }));
        
        console.log('Argentina Leagues found:', leagues);
    } catch (error) {
        console.error("Search failed:", error);
    }
}

search();
