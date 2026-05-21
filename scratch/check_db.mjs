import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    try {
        console.log('--- LEAGUES / MATCHES IN SUPABASE ---');
        const { data: leagues, error: lError } = await supabase
            .from('matches')
            .select('league_id, count(*)', { count: 'exact' });
        
        // Group by league_id manually
        const counts = {};
        const { data: matches, error: mError } = await supabase.from('matches').select('league_id, season, status');
        if (mError) throw mError;
        
        matches.forEach(m => {
            const key = `${m.league_id} (season ${m.season})`;
            counts[key] = counts[key] || { total: 0, finished: 0, upcoming: 0, live: 0 };
            counts[key].total++;
            if (m.status === 'FINISHED') counts[key].finished++;
            else if (m.status === 'UPCOMING' || m.status === 'scheduled') counts[key].upcoming++;
            else counts[key].live++;
        });
        
        console.log('Match counts by league/season:', counts);
        
        console.log('\n--- STANDINGS IN SUPABASE ---');
        const { data: standings, error: sError } = await supabase
            .from('standings')
            .select('league_id, season, count(*)')
            .limit(10);
        
        const standingsCounts = {};
        const { data: allStandings, error: asError } = await supabase.from('standings').select('league_id, season');
        if (asError) throw asError;
        allStandings.forEach(s => {
            const key = `${s.league_id} (season ${s.season})`;
            standingsCounts[key] = (standingsCounts[key] || 0) + 1;
        });
        console.log('Standings counts by league/season:', standingsCounts);
        
    } catch (e) {
        console.error(e);
    }
}

check();
