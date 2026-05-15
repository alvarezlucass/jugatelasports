
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars manually since we are running this script directly with node/ts-node
// In a real project we'd use dotenv, but for this quick script let's try to parse the .env file

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const envPath = path.resolve(projectRoot, '.env');

console.log(`Reading .env from ${envPath}`);

let API_KEY = '';
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/VITE_API_FOOTBALL_KEY=(.*)/);
    if (match && match[1]) {
        API_KEY = match[1].trim();
    }
} catch (e) {
    console.error("Could not read .env file");
    process.exit(1);
}

if (!API_KEY) {
    console.error("API Key not found in .env");
    process.exit(1);
}

const BASE_URL = 'https://v3.football.api-sports.io';
// Wait, search result said "The API-Football competition ID for the FIFA World Cup is 1".
// Let's trust the search result or my knowledge. World Cup is often ID 1.

async function fetchData(endpoint: string) {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
        headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': API_KEY
        }
    });
    return await response.json();
}

async function main() {
    console.log("Fetching World Cup repository...");

    // 1. Fetch available seasons for the World Cup
    // The endpoint is /leagues?id=1
    // Actually, let's use the ID we found: 1 is usually World Cup.
    const leagueInfo = await fetchData('leagues?id=1');

    if (leagueInfo.errors && Object.keys(leagueInfo.errors).length > 0) {
        console.error("API Error:", leagueInfo.errors);
        return;
    }

    if (leagueInfo.results === 0) {
        console.error("No league found with ID 1. Trying to search for 'World Cup'...");
        const search = await fetchData('leagues?search=World Cup');
        console.log("Search results:", JSON.stringify(search.response.slice(0, 3), null, 2));
        return;
    }

    const leagueData = leagueInfo.response[0];
    const seasons = leagueData.seasons;

    console.log(`Found ${seasons.length} seasons for ${leagueData.league.name}`);

    // Create the history structure
    const historyData = {
        league: leagueData.league,
        country: leagueData.country,
        seasons: seasons.map((s: any) => ({
            year: s.year,
            start: s.start,
            end: s.end,
            winner: null // We could fetch winners if needed, usually in 'standings' or 'fixtures'
        }))
    };

    // Save to file
    const outputPath = path.resolve(__dirname, '../data/history/worldcup_summary.json');
    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    fs.writeFileSync(outputPath, JSON.stringify(historyData, null, 2));
    console.log(`Saved history summary to ${outputPath}`);
}

main().catch(console.error);
