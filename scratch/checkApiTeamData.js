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

async function analyzeTeamData() {
    const teamId = 484; // Nueva Chicago
    const season = 2026; // Adjust season if necessary (Primera Nacional is 2026 in DB)
    const leagueId = 129; // Primera Nacional

    console.log(`Buscando datos del equipo ${teamId} en la API...`);

    // 1. Team Info
    const teamInfo = await fetchFromApi('teams', { id: teamId });
    console.log('\n--- TEAM INFO ---');
    console.log(JSON.stringify(teamInfo, null, 2));

    // 2. Coach
    const coachInfo = await fetchFromApi('coachs', { team: teamId });
    console.log('\n--- COACH INFO ---');
    console.log(JSON.stringify(coachInfo, null, 2));

    // 3. Squad
    const squadInfo = await fetchFromApi('players/squads', { team: teamId });
    console.log('\n--- SQUAD INFO ---');
    console.log(JSON.stringify(squadInfo, null, 2));

    // 4. Statistics
    const statsInfo = await fetchFromApi('teams/statistics', { team: teamId, season: season, league: leagueId });
    console.log('\n--- TEAM STATISTICS ---');
    console.log(JSON.stringify(statsInfo, null, 2));
}

analyzeTeamData();
