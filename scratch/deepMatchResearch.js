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

async function deepMatchResearch() {
    const fixtureId = 1316169; // From our previous sync (San Martin S.J. vs Nueva Chicago)

    console.log(`\n--- FIXTURE EVENTS ---`);
    const events = await fetchFromApi('fixtures/events', { fixture: fixtureId });
    console.log(JSON.stringify(events?.slice(0, 3) || [], null, 2));

    console.log(`\n--- FIXTURE LINEUPS ---`);
    const lineups = await fetchFromApi('fixtures/lineups', { fixture: fixtureId });
    console.log(JSON.stringify(lineups?.[0]?.formation || "No lineup info", null, 2));
    
    console.log(`\n--- FIXTURE PLAYER STATS ---`);
    const playerStats = await fetchFromApi('fixtures/players', { fixture: fixtureId });
    console.log("Player stats available?", playerStats && playerStats.length > 0 ? "YES" : "NO");
    if (playerStats && playerStats.length > 0) {
        // Just show first player stats keys
        console.log("Keys for a player's match stats:", Object.keys(playerStats[0].players[0].statistics[0]));
    }
}

deepMatchResearch();
