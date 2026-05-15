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

async function testQualifiers() {
    const url = `${API_URL}/standings?league=34&season=2026`;
    console.log(`Fetching ${url}...`);

    https.get(url, {
        headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': API_KEY
        }
    }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const parsed = JSON.parse(data);
            if (parsed.errors && Object.keys(parsed.errors).length > 0) {
                console.log("ERRORS:", parsed.errors);
            } else {
                console.log("SUCCESS! Got standings info for Qualifiers");
                if(parsed.response.length > 0) {
                    console.log(`Found ${parsed.response[0].league.standings[0].length} teams in CONMEBOL`);
                    console.log("Top team:", parsed.response[0].league.standings[0][0].team.name);
                }
            }
        });
    });
}

testQualifiers();
