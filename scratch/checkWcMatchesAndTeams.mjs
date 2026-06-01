import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    // 1. Get all matches for World Cup 2026
    const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .eq('league_id', '1');
        
    if (error) {
        console.error(error);
        process.exit(1);
    }
    
    console.log(`Found ${matches.length} WC matches.`);
    
    // Collect all team names
    const teams = new Set();
    matches.forEach(m => {
        teams.add(m.home_team);
        teams.add(m.away_team);
    });
    
    console.log('Team names in WC matches:', Array.from(teams).sort());
    
    // Find relations in league_teams
    const { data: relations } = await supabase
        .from('league_teams')
        .select('*, teams(name, short_name)')
        .eq('league_id', 'world-cup-2026');
        
    console.log('\nRelations in league_teams for world-cup-2026:');
    relations?.forEach(r => {
        console.log(`- Team ID: ${r.team_id} - DB Name: ${r.teams?.name} (Code: ${r.teams?.short_name})`);
    });
    
    process.exit(0);
}

main();
