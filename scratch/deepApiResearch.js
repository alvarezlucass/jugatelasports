import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_API_FOOTBALL_KEY;
const API_URL = process.env.VITE_API_FOOTBALL_URL || 'https://v3.football.api-sports.io';

async function fetchFromApi(endpoint, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_URL}/${endpoint}?${queryParams}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': API_KEY
            }
        });
        const json = await response.json();
        return json.response;
    } catch (error) {
        console.error(`Request to ${endpoint} failed:`, error);
        return null;
    }
}

async function deepResearch() {
    const playerId = 323784; // G. Vega

    console.log(`\n--- PLAYER DEEP STATS (2024) ---`);
    const playerStats24 = await fetchFromApi('players', { id: playerId, season: 2024 });
    if (playerStats24 && playerStats24.length > 0) {
        console.log("Found stats for 2024!");
        console.log(JSON.stringify(playerStats24[0].statistics[0], null, 2));
    } else {
        console.log("No stats for 2024");
    }

    console.log(`\n--- MATCH STATISTICS (POSSESSION, ETC) ---`);
    // Find a match in Liga Profesional (League 128) which usually has deep stats
    const fixtures = await fetchFromApi('fixtures', { league: 128, season: 2024, last: 1 });
    if (fixtures && fixtures.length > 0) {
        const fixtureId = fixtures[0].fixture.id;
        const matchStats = await fetchFromApi('fixtures/statistics', { fixture: fixtureId });
        console.log(JSON.stringify(matchStats, null, 2));
    }
}

deepResearch();
