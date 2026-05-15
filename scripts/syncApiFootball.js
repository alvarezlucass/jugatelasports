require('dotenv').config();
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.VITE_API_FOOTBALL_KEY;
const API_URL = process.env.VITE_API_FOOTBALL_URL || 'https://v3.football.api-sports.io';

const headers = {
    'x-rapidapi-host': 'v3.football.api-sports.io',
    'x-rapidapi-key': API_KEY
};

const LEAGUE_ID = 1; // World Cup
const SEASON = 2022; // Using 2022 as it has complete data, 2026 is empty

const DATA_DIR = path.join(__dirname, '..', 'src', 'data', 'api-football');

async function fetchRoute(route, filename) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    
    const url = `${API_URL}/${route}?league=${LEAGUE_ID}&season=${SEASON}`;
    console.log(`Fetching ${url}...`);

    try {
        const response = await fetch(url, { method: 'GET', headers });
        const json = await response.json();

        if (json.errors && Object.keys(json.errors).length > 0) {
            console.error(`Error fetching ${route}:`, json.errors);
            return false;
        }

        const filePath = path.join(DATA_DIR, filename);
        fs.writeFileSync(filePath, JSON.stringify(json.response, null, 2));
        console.log(`Successfully saved ${json.response.length || 1} records to ${filename}`);
        return true;
    } catch (error) {
        console.error(`Failed to fetch ${route}:`, error);
        return false;
    }
}

async function syncAll() {
    if (!API_KEY) {
        console.error("VITE_API_FOOTBALL_KEY not found in .env. Exiting.");
        process.exit(1);
    }

    console.log(`Starting API-Football Sync for League ${LEAGUE_ID} Season ${SEASON}`);
    
    await fetchRoute('teams', 'teams.json');
    
    // Para no exceder límites rápidos si estás en plan basico, esperamos 1 segundo entre llamados
    await new Promise(r => setTimeout(r, 1000));
    await fetchRoute('fixtures', 'fixtures.json');

    await new Promise(r => setTimeout(r, 1000));
    await fetchRoute('standings', 'standings.json');

    console.log('Sync Complete! 3 API requests used.');
}

syncAll();
