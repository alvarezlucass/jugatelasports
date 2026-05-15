const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const API_KEY = '1a15fdebb7c077337316421ed9239380';
const BASE_URL = 'v3.football.api-sports.io';
const LEAGUES = [
    { id: 140, name: 'La Liga' },
    { id: 128, name: 'Argentina Liga Profesional' },
    { id: 129, name: 'Argentina Primera B Nacional' },
    { id: 4, name: 'UEFA Euro' },
    { id: 2, name: 'UEFA Champions League' },
    { id: 9, name: 'Copa America' }
];
const SEASONS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAPI(endpoint, params) {
    const queryString = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
    const options = {
        hostname: BASE_URL,
        path: `/${endpoint}?${queryString}`,
        method: 'GET',
        headers: {
            'x-rapidapi-host': BASE_URL,
            'x-rapidapi-key': API_KEY
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.get(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`API Error: ${res.statusCode} - ${data}`));
                }
            });
        });
        req.on('error', (err) => reject(err));
    });
}

function ensureDirectory(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

async function archive() {
    console.log('🚀 Starting Football Data Archiving (2020-2026)...');
    let totalRequests = 0;

    for (const league of LEAGUES) {
        console.log(`\n🏆 Archiving League: ${league.name} (ID: ${league.id})`);

        for (const season of SEASONS) {
            const outputDir = path.join(__dirname, '..', 'src', 'data', 'leagues', league.id.toString(), season.toString());
            ensureDirectory(outputDir);

            // 1. Fetch Standings
            try {
                const standingsFile = path.join(outputDir, 'standings.json');
                if (!fs.existsSync(standingsFile)) {
                    console.log(`  📅 Season ${season}: Fetching Standings...`);
                    const data = await fetchAPI('standings', { league: league.id, season });
                    if (data && data.response && data.response.length > 0) {
                        fs.writeFileSync(standingsFile, JSON.stringify(data, null, 2));
                        totalRequests++;
                        await sleep(1000); // Respect burst limit
                    } else {
                        console.log(`  ⚠️ No standings for ${league.name} in ${season}`);
                    }
                } else {
                    console.log(`  ✅ Season ${season}: Standings already exist.`);
                }
            } catch (err) {
                console.error(`  ❌ Error fetching standings for ${league.id} ${season}:`, err.message);
            }

            // 2. Fetch Fixtures (Matches)
            try {
                const fixturesFile = path.join(outputDir, 'fixtures.json');
                if (!fs.existsSync(fixturesFile)) {
                    console.log(`  📅 Season ${season}: Fetching Fixtures...`);
                    const data = await fetchAPI('fixtures', { league: league.id, season });
                    if (data && data.response && data.response.length > 0) {
                        fs.writeFileSync(fixturesFile, JSON.stringify(data, null, 2));
                        totalRequests++;
                        await sleep(1000); // Respect burst limit
                    } else {
                        console.log(`  ⚠️ No fixtures for ${league.name} in ${season}`);
                    }
                } else {
                    console.log(`  ✅ Season ${season}: Fixtures already exist.`);
                }
            } catch (err) {
                console.error(`  ❌ Error fetching fixtures for ${league.id} ${season}:`, err.message);
            }

            // Check if we approach the daily limit (keep some safety margin)
            if (totalRequests >= 95) {
                console.warn('\n🛑 Daily API limit (100) and safety margin reached. Stopping for today.');
                process.exit(0);
            }
        }
    }

    console.log(`\n✅ Archiving complete. Total requests made: ${totalRequests}`);
}

archive();
