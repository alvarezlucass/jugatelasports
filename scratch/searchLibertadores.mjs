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
        console.log("Searching for 'Libertadores' leagues using 'search' parameter...");
        const response = await fetch(`${API_URL}/leagues?search=Libertadores`, { method: 'GET', headers });
        const json = await response.json();
        
        console.log("Results:");
        if (json.response) {
            json.response.forEach(item => {
                console.log(`- League ID: ${item.league.id}, Name: ${item.league.name}, Type: ${item.league.type}, Country: ${item.country.name}`);
            });
        } else {
            console.log("No response:", json);
        }
    } catch (error) {
        console.error("Failed:", error);
    }
}

search();
