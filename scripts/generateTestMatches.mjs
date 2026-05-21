import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing required environment variables VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ADMIN_EMAIL = 'admin@jugatelasports.com';
const ADMIN_PASSWORD = '@Marte2026';

async function authenticateAsAdmin() {
    console.log('Authenticating as admin to bypass RLS policies...');
    const { data, error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });
    if (error) {
        console.error('Failed to authenticate as admin. Upserts might fail if RLS blocks them:', error.message);
    } else {
        console.log('Successfully authenticated as Admin.');
    }
}

function getRoundNumber(roundName) {
    if (!roundName) return 999;
    const numMatch = roundName.match(/\d+/);
    if (!numMatch) return 999;
    const num = parseInt(numMatch[0], 10);
    // Give 2nd Phase higher priority so it sorts after Regular Season/1st Phase
    if (roundName.toLowerCase().includes('2nd phase')) {
        return num + 100;
    }
    return num;
}

async function run() {
    await authenticateAsAdmin();

    console.log('Cleaning up previous simulated test matches...');
    const { error: deleteError } = await supabase
        .from('matches')
        .delete()
        .like('id', 'test-lpf-%');
    
    if (deleteError) {
        console.error('Error cleaning up previous matches:', deleteError.message);
    } else {
        console.log('Previous test matches cleaned up successfully.');
    }

    console.log('Fetching historical LPF 2024 matches...');
    const { data: originalMatches, error: fetchError } = await supabase
        .from('matches')
        .select('*')
        .eq('league_id', '128')
        .eq('season', 2024);

    if (fetchError) {
        console.error('Error fetching historical matches:', fetchError.message);
        process.exit(1);
    }

    if (!originalMatches || originalMatches.length === 0) {
        console.log('No historical matches found for Liga Profesional (league_id 128, season 2024).');
        process.exit(1);
    }

    console.log(`Found ${originalMatches.length} historical matches.`);

    // Group by round
    const roundsMap = {};
    for (const m of originalMatches) {
        const roundName = m.metadata?.round || 'Regular Season - 1';
        if (!roundsMap[roundName]) {
            roundsMap[roundName] = [];
        }
        roundsMap[roundName].push(m);
    }

    const sortedRoundNames = Object.keys(roundsMap).sort((a, b) => getRoundNumber(a) - getRoundNumber(b));
    console.log(`Sorted rounds: ${sortedRoundNames.join(', ')}`);

    const testMatches = [];

    // 1. Add the Copa de la Liga Final (Sunday, May 24, 2026, 15:30 local / 18:30 UTC)
    console.log('Adding Copa de la Liga Final (River Plate vs Belgrano)...');
    testMatches.push({
        id: 'test-lpf-final-2026',
        league_id: '128',
        season: 2026,
        home_team: 'River Plate',
        home_team_logo: 'https://media.api-sports.io/football/teams/435.png',
        away_team: 'Belgrano Cordoba',
        away_team_logo: 'https://media.api-sports.io/football/teams/440.png',
        start_time: '2026-05-24T18:30:00Z', // 15:30 GMT-3
        status: 'UPCOMING',
        home_score: null,
        away_score: null,
        odds: { home: 1.8, draw: 3.4, away: 4.5 },
        metadata: {
            round: 'Copa de la Liga - Final',
            stadium: 'Estadio Mario Alberto Kempes',
            city: 'Ciudad de Córdoba, Provincia de Córdoba',
            is_test: true
        },
        updated_at: new Date().toISOString()
    });

    // 2. Set the regular season start date to July 23, 2026 (after the World Cup recess)
    const regularSeasonStartDate = new Date('2026-07-23T18:00:00.000Z'); // 15:00 GMT-3 on July 23, 2026

    // Let's generate future matches for the next 27 rounds
    for (let rIdx = 0; rIdx < sortedRoundNames.length; rIdx++) {
        const roundName = sortedRoundNames[rIdx];
        const roundMatches = roundsMap[roundName];
        
        // Space each round by 4 days
        const roundBaseTime = regularSeasonStartDate.getTime() + rIdx * 4 * 24 * 60 * 60 * 1000;
        
        for (let mIdx = 0; mIdx < roundMatches.length; mIdx++) {
            const origMatch = roundMatches[mIdx];
            
            // Spread matches of the same round:
            // Alternating days and hours to look realistic
            const dayOffset = mIdx % 2; 
            const hourOffset = Math.floor(mIdx / 2) * 2; // 0, 2, 4, 6, 8, 10, 12 hours
            
            const matchTime = new Date(roundBaseTime + dayOffset * 24 * 60 * 60 * 1000 + hourOffset * 60 * 60 * 1000);
            
            const newId = `test-lpf-${origMatch.id}`;
            
            testMatches.push({
                id: newId,
                league_id: '128',
                season: 2026,
                home_team: origMatch.home_team,
                home_team_logo: origMatch.home_team_logo,
                away_team: origMatch.away_team,
                away_team_logo: origMatch.away_team_logo,
                start_time: matchTime.toISOString(),
                status: 'UPCOMING',
                home_score: null,
                away_score: null,
                odds: origMatch.odds || { home: 2.1, draw: 3.1, away: 3.4 },
                metadata: {
                    ...(origMatch.metadata || {}),
                    is_test: true,
                    original_id: origMatch.id
                },
                updated_at: new Date().toISOString()
            });
        }
    }

    console.log(`Generated ${testMatches.length} upcoming matches for season 2026 (including Final).`);

    // Upsert matches in batches of 100
    const BATCH_SIZE = 100;
    let upsertedCount = 0;

    for (let i = 0; i < testMatches.length; i += BATCH_SIZE) {
        const batch = testMatches.slice(i, i + BATCH_SIZE);
        console.log(`Upserting batch ${i / BATCH_SIZE + 1}...`);
        
        const { error: upsertError } = await supabase
            .from('matches')
            .upsert(batch, { onConflict: 'id' });
            
        if (upsertError) {
            console.error(`Failed to upsert batch:`, upsertError.message);
        } else {
            upsertedCount += batch.length;
        }
    }

    console.log(`\nSuccessfully populated ${upsertedCount} test matches in the database!`);
    process.exit(0);
}

run();
