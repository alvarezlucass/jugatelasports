
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Comprehensive list with Golden Boot and Final Score
const worldCupHistory = [
    {
        year: 1930, host: 'Uruguay', winner: 'Uruguay', runnerUp: 'Argentina', teams: 13,
        finalScore: '4 - 2',
        topScorer: 'Guillermo Stábile', topScorerGoals: 8
    },
    {
        year: 1934, host: 'Italy', winner: 'Italy', runnerUp: 'Czechoslovakia', teams: 16,
        finalScore: '2 - 1 (AET)',
        topScorer: 'Oldřich Nejedlý', topScorerGoals: 5
    },
    {
        year: 1938, host: 'France', winner: 'Italy', runnerUp: 'Hungary', teams: 15,
        finalScore: '4 - 2',
        topScorer: 'Leônidas', topScorerGoals: 7
    },
    {
        year: 1950, host: 'Brazil', winner: 'Uruguay', runnerUp: 'Brazil', teams: 13,
        finalScore: '2 - 1', // Maracanazo (technically round robin final match)
        topScorer: 'Ademir', topScorerGoals: 8
    },
    {
        year: 1954, host: 'Switzerland', winner: 'West Germany', runnerUp: 'Hungary', teams: 16,
        finalScore: '3 - 2',
        topScorer: 'Sándor Kocsis', topScorerGoals: 11
    },
    {
        year: 1958, host: 'Sweden', winner: 'Brazil', runnerUp: 'Sweden', teams: 16,
        finalScore: '5 - 2',
        topScorer: 'Just Fontaine', topScorerGoals: 13
    },
    {
        year: 1962, host: 'Chile', winner: 'Brazil', runnerUp: 'Czechoslovakia', teams: 16,
        finalScore: '3 - 1',
        topScorer: 'Garrincha / Vavá', topScorerGoals: 4
    },
    {
        year: 1966, host: 'England', winner: 'England', runnerUp: 'West Germany', teams: 16,
        finalScore: '4 - 2 (AET)',
        topScorer: 'Eusébio', topScorerGoals: 9
    },
    {
        year: 1970, host: 'Mexico', winner: 'Brazil', runnerUp: 'Italy', teams: 16,
        finalScore: '4 - 1',
        topScorer: 'Gerd Müller', topScorerGoals: 10
    },
    {
        year: 1974, host: 'West Germany', winner: 'West Germany', runnerUp: 'Netherlands', teams: 16,
        finalScore: '2 - 1',
        topScorer: 'Grzegorz Lato', topScorerGoals: 7
    },
    {
        year: 1978, host: 'Argentina', winner: 'Argentina', runnerUp: 'Netherlands', teams: 16,
        finalScore: '3 - 1 (AET)',
        topScorer: 'Mario Kempes', topScorerGoals: 6
    },
    {
        year: 1982, host: 'Spain', winner: 'Italy', runnerUp: 'West Germany', teams: 24,
        finalScore: '3 - 1',
        topScorer: 'Paolo Rossi', topScorerGoals: 6
    },
    {
        year: 1986, host: 'Mexico', winner: 'Argentina', runnerUp: 'West Germany', teams: 24,
        finalScore: '3 - 2',
        topScorer: 'Gary Lineker', topScorerGoals: 6
    },
    {
        year: 1990, host: 'Italy', winner: 'West Germany', runnerUp: 'Argentina', teams: 24,
        finalScore: '1 - 0',
        topScorer: 'Salvatore Schillaci', topScorerGoals: 6
    },
    {
        year: 1994, host: 'United States', winner: 'Brazil', runnerUp: 'Italy', teams: 24,
        finalScore: '0 - 0 (3-2 pen)',
        topScorer: 'Hristo Stoichkov / Oleg Salenko', topScorerGoals: 6
    },
    {
        year: 1998, host: 'France', winner: 'France', runnerUp: 'Brazil', teams: 32,
        finalScore: '3 - 0',
        topScorer: 'Davor Šuker', topScorerGoals: 6
    },
    {
        year: 2002, host: 'South Korea, Japan', winner: 'Brazil', runnerUp: 'Germany', teams: 32,
        finalScore: '2 - 0',
        topScorer: 'Ronaldo', topScorerGoals: 8
    },
    {
        year: 2006, host: 'Germany', winner: 'Italy', runnerUp: 'France', teams: 32,
        finalScore: '1 - 1 (5-3 pen)',
        topScorer: 'Miroslav Klose', topScorerGoals: 5
    },
    {
        year: 2010, host: 'South Africa', winner: 'Spain', runnerUp: 'Netherlands', teams: 32,
        finalScore: '1 - 0 (AET)',
        topScorer: 'Thomas Müller', topScorerGoals: 5
    },
    {
        year: 2014, host: 'Brazil', winner: 'Germany', runnerUp: 'Argentina', teams: 32,
        finalScore: '1 - 0 (AET)',
        topScorer: 'James Rodríguez', topScorerGoals: 6
    },
    {
        year: 2018, host: 'Russia', winner: 'France', runnerUp: 'Croatia', teams: 32,
        finalScore: '4 - 2',
        topScorer: 'Harry Kane', topScorerGoals: 6
    },
    {
        year: 2022, host: 'Qatar', winner: 'Argentina', runnerUp: 'France', teams: 32,
        finalScore: '3 - 3 (4-2 pen)',
        topScorer: 'Kylian Mbappé', topScorerGoals: 8
    }
];

async function main() {
    const outputPath = path.resolve(__dirname, '../data/history/worldcup_full.json');

    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    fs.writeFileSync(outputPath, JSON.stringify(worldCupHistory, null, 2));
    console.log(`Saved enriched history to ${outputPath}`);
}

main().catch(console.error);
