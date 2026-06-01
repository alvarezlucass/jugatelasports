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

async function fetchStandings() {
    try {
        console.log("Fetching standings for Copa Libertadores (13) season 2026...");
        const response = await fetch(`${API_URL}/standings?league=13&season=2026`, { method: 'GET', headers });
        const json = await response.json();
        
        console.log("API Response summary:");
        if (json.response && json.response.length > 0) {
            const league = json.response[0].league;
            console.log(`Name: ${league.name}, Season: ${league.season}`);
            const standings = league.standings;
            console.log(`Groups/Tables count: ${standings.length}`);
            standings.forEach((group, idx) => {
                console.log(`Group ${idx + 1}:`);
                group.slice(0, 2).forEach(item => {
                    console.log(`  - Rank ${item.rank}: Team ${item.team.name} (ID: ${item.team.id}), Points: ${item.points}`);
                });
            });
        } else {
            console.log("No response or empty:", json);
        }
    } catch (error) {
        console.error("Failed:", error);
    }
}

fetchStandings();
