
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Comprehensive list of World Cup winners and hosts
const worldCupHistory = [
    { year: 1930, host: 'Uruguay', winner: 'Uruguay', runnerUp: 'Argentina', teams: 13 },
    { year: 1934, host: 'Italy', winner: 'Italy', runnerUp: 'Czechoslovakia', teams: 16 },
    { year: 1938, host: 'France', winner: 'Italy', runnerUp: 'Hungary', teams: 15 },
    { year: 1950, host: 'Brazil', winner: 'Uruguay', runnerUp: 'Brazil', teams: 13 },
    { year: 1954, host: 'Switzerland', winner: 'West Germany', runnerUp: 'Hungary', teams: 16 },
    { year: 1958, host: 'Sweden', winner: 'Brazil', runnerUp: 'Sweden', teams: 16 },
    { year: 1962, host: 'Chile', winner: 'Brazil', runnerUp: 'Czechoslovakia', teams: 16 },
    { year: 1966, host: 'England', winner: 'England', runnerUp: 'West Germany', teams: 16 },
    { year: 1970, host: 'Mexico', winner: 'Brazil', runnerUp: 'Italy', teams: 16 },
    { year: 1974, host: 'West Germany', winner: 'West Germany', runnerUp: 'Netherlands', teams: 16 },
    { year: 1978, host: 'Argentina', winner: 'Argentina', runnerUp: 'Netherlands', teams: 16 },
    { year: 1982, host: 'Spain', winner: 'Italy', runnerUp: 'West Germany', teams: 24 },
    { year: 1986, host: 'Mexico', winner: 'Argentina', runnerUp: 'West Germany', teams: 24 },
    { year: 1990, host: 'Italy', winner: 'West Germany', runnerUp: 'Argentina', teams: 24 },
    { year: 1994, host: 'United States', winner: 'Brazil', runnerUp: 'Italy', teams: 24 },
    { year: 1998, host: 'France', winner: 'France', runnerUp: 'Brazil', teams: 32 },
    { year: 2002, host: 'South Korea, Japan', winner: 'Brazil', runnerUp: 'Germany', teams: 32 },
    { year: 2006, host: 'Germany', winner: 'Italy', runnerUp: 'France', teams: 32 },
    { year: 2010, host: 'South Africa', winner: 'Spain', runnerUp: 'Netherlands', teams: 32 },
    { year: 2014, host: 'Brazil', winner: 'Germany', runnerUp: 'Argentina', teams: 32 },
    { year: 2018, host: 'Russia', winner: 'France', runnerUp: 'Croatia', teams: 32 },
    { year: 2022, host: 'Qatar', winner: 'Argentina', runnerUp: 'France', teams: 32 }
];

async function main() {
    const outputPath = path.resolve(__dirname, '../data/history/worldcup_full.json');

    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    fs.writeFileSync(outputPath, JSON.stringify(worldCupHistory, null, 2));
    console.log(`Saved full history to ${outputPath}`);
}

main().catch(console.error);
