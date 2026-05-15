
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const envPath = path.resolve(projectRoot, '.env');

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

const BASE_URL = 'https://v3.football.api-sports.io';

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
    console.log("Testing 1930 access...");
    const data = await fetchData('fixtures?league=1&season=1930');
    console.log("Response:", JSON.stringify(data, null, 2));
}

main().catch(console.error);
