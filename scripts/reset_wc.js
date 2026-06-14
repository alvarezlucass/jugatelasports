import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function resetWC() {
    console.log('Reading worldCupPersistence.ts...');
    const content = fs.readFileSync('src/data/worldCupPersistence.ts', 'utf8');
    
    // Extract matches using regex
    const matchesRegex = /{ id: '(.*?)', group: '(.*?)', homeTeam: '(.*?)', awayTeam: '(.*?)', date: '(.*?)', time: '(.*?)', stadium: '(.*?)', city: '(.*?)', status: '(.*?)'(?:, homeScore: (.*?), awayScore: (.*?))? }/g;
    let match;
    const matchesToSync = [];

    while ((match = matchesRegex.exec(content)) !== null) {
        matchesToSync.push({
            id: match[1],
            league_id: 'world-cup-2026',
            season: 2026,
            home_team: match[3],
            away_team: match[4],
            start_time: `${match[5]}T${match[6]}:00Z`,
            status: match[9].toUpperCase(),
            home_score: match[10] ? parseInt(match[10]) : 0,
            away_score: match[11] ? parseInt(match[11]) : 0,
            metadata: {
                group: match[2],
                stadium: match[7],
                city: match[8]
            }
        });
    }

    console.log(`Re-inserting ${matchesToSync.length} World Cup matches...`);

    const { error } = await supabase
        .from('matches')
        .upsert(matchesToSync, { onConflict: 'id' });

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Reset complete!');
    }
}

resetWC();
