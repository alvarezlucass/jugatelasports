import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const API_KEY = process.env.VITE_API_FOOTBALL_KEY;
const API_URL = process.env.VITE_API_FOOTBALL_URL || 'https://v3.football.api-sports.io';
const DATA_DIR = path.resolve(__dirname, '../src/data/api-football-2026');

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

let requestsUsed = 0;

async function fetchFromApi(endpoint, params) {
    return new Promise((resolve, reject) => {
        const queryParams = new URLSearchParams(params).toString();
        const url = `${API_URL}/${endpoint}?${queryParams}`;
        
        console.log(`Fetching ${url}...`);
        
        const options = {
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': API_KEY
            }
        };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                requestsUsed++;
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.errors && Object.keys(parsed.errors).length > 0) {
                        reject(parsed.errors);
                    } else {
                        resolve(parsed.response);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

function saveToFile(filename, data) {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Successfully saved ${data.length || 0} records to ${filename}`);
}

async function syncAll2026() {
    try {
        const SEASON = 2026;
        const WC_LEAGUE_ID = 1;

        // 1. World Cup 2026 Teams
        const teams = await fetchFromApi('teams', { league: WC_LEAGUE_ID, season: SEASON });
        saveToFile('teams.json', teams);

        // 2. World Cup 2026 Fixtures
        const fixtures = await fetchFromApi('fixtures', { league: WC_LEAGUE_ID, season: SEASON });
        saveToFile('fixtures.json', fixtures);

        // 3. World Cup 2026 Standings (Groups)
        const standings = await fetchFromApi('standings', { league: WC_LEAGUE_ID, season: SEASON });
        saveToFile('standings.json', standings);

        // 4. Qualifiers (Eliminatorias) Standings
        const QUALIFIER_LEAGUES = [
            { id: 34, name: 'CONMEBOL' },
            { id: 31, name: 'CONCACAF' },
            { id: 32, name: 'UEFA' },
            { id: 29, name: 'CAF' },
            { id: 30, name: 'AFC' },
            { id: 33, name: 'OFC' }
        ];

        let allQualifiers = [];
        
        for (const q of QUALIFIER_LEAGUES) {
            console.log(`Fetching Qualifiers for ${q.name}...`);
            const qStandings = await fetchFromApi('standings', { league: q.id, season: SEASON });
            if (qStandings && qStandings.length > 0) {
                allQualifiers.push({
                    region: q.name,
                    id: q.id,
                    data: qStandings[0].league.standings
                });
            }
            // Small delay to prevent rate limits
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        saveToFile('qualifiers.json', allQualifiers);

        console.log(`\nSync Complete! ${requestsUsed} API requests used.`);

    } catch (error) {
        console.error("Error during sync:", error);
    }
}

syncAll2026();
