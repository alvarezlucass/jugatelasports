import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function checkDuplicates() {
    let allMatches = [];
    let from = 0;
    const step = 1000;
    
    while (true) {
        const { data: matches, error } = await supabase
            .from('matches')
            .select('*')
            .range(from, from + step - 1);

        if (error) {
            console.error('Error fetching matches:', error);
            return;
        }

        if (matches.length === 0) {
            break;
        }

        allMatches = allMatches.concat(matches);
        from += step;
    }

    console.log(`Fetched ${allMatches.length} matches.`);

    const wcMatches = allMatches.filter(m => m.league_id === 'world-cup-2026' || m.league_id === '128' || m.league_id === 'World Cup' || (m.home_team && m.home_team.toLowerCase().includes('brazil')));

    console.log(`Found ${wcMatches.length} matches that might be World Cup.`);
    
    const byTeams = new Map();
    for(const m of wcMatches) {
        console.log(`ID: ${m.id} | ${m.home_team} vs ${m.away_team} | League: ${m.league_id} | Group: ${m.metadata?.group || m.metadata?.round}`);
    }
}

checkDuplicates();
