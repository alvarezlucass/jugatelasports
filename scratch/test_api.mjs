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

async function testEndpoint(endpoint, params) {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_URL}/${endpoint}?${queryParams}`;
    console.log(`\nTesting: ${url}`);
    try {
        const response = await fetch(url, { method: 'GET', headers });
        const json = await response.json();
        if (json.errors && Object.keys(json.errors).length > 0) {
            console.log('Errors:', json.errors);
        } else {
            console.log('Success! Response count:', json.response ? json.response.length : 0);
            if (json.response && json.response.length > 0) {
                console.log('First response item sample (keys):', Object.keys(json.response[0]));
                if (endpoint === 'leagues') {
                    console.log('Seasons available:', json.response[0].seasons.map(s => s.year));
                } else if (endpoint === 'fixtures') {
                    console.log('First fixture teams:', json.response[0].teams.home.name, 'vs', json.response[0].teams.away.name);
                    console.log('First fixture status:', json.response[0].fixture.status);
                }
            }
        }
    } catch (error) {
        console.error("Failed:", error);
    }
}

async function run() {
    // 1. Check League 128 (Argentine League) seasons
    await testEndpoint('leagues', { id: 128 });
    
    // 2. Test fetching fixtures for League 128 (Argentine League) season 2024
    await testEndpoint('fixtures', { league: 128, season: 2024 });

    // 3. Test fetching fixtures for League 128 (Argentine League) season 2025
    await testEndpoint('fixtures', { league: 128, season: 2025 });

    // 4. Test fetching fixtures for League 128 (Argentine League) season 2026
    await testEndpoint('fixtures', { league: 128, season: 2026 });

    // 5. Test fetching fixtures for League 1 (World Cup) season 2026
    await testEndpoint('fixtures', { league: 1, season: 2026 });
    
    // 6. Test fetching fixtures for League 34 (South American Qualifiers) season 2026
    await testEndpoint('fixtures', { league: 34, season: 2026 });
}

run();
