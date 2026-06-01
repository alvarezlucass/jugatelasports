import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspect() {
    const leagues = ['ucl', 'premier', 'libertadores', 'laliga', 'lpf'];
    
    for (const league of leagues) {
        console.log(`\n=== LEAGUE: ${league} ===`);
        
        // Count standings
        const { data: standings, error: sErr } = await supabase
            .from('standings')
            .select('season, team_id, rank')
            .eq('league_id', league);
            
        if (sErr) {
            console.error(`Error standings for ${league}:`, sErr);
        } else {
            console.log(`Standings: ${standings.length} entries.`);
            const seasons = [...new Set(standings.map(s => s.season))];
            console.log(`Seasons: ${seasons.join(', ')}`);
            const mockCount = standings.filter(s => s.team_id >= 500 && s.team_id <= 900).length;
            console.log(`Mock standings entries (team_id 500-900): ${mockCount}`);
        }

        // Count league_teams
        const { data: rels, error: rErr } = await supabase
            .from('league_teams')
            .select('season, team_id')
            .eq('league_id', league);
            
        if (rErr) {
            console.error(`Error league_teams for ${league}:`, rErr);
        } else {
            console.log(`League-teams: ${rels.length} entries.`);
            const mockCount = rels.filter(r => r.team_id >= 500 && r.team_id <= 900).length;
            console.log(`Mock league_teams entries (team_id 500-900): ${mockCount}`);
        }

        // Count matches
        // Match league ID might be numeric
        const mappedMatchLeagueId = 
            league === 'lpf' ? '128' : 
            league === 'ucl' ? '2' : 
            league === 'premier' ? '39' : 
            league === 'libertadores' ? '13' : 
            league === 'laliga' ? '140' : league;
            
        const { data: matches, error: mErr } = await supabase
            .from('matches')
            .select('id, season, status')
            .eq('league_id', mappedMatchLeagueId);
            
        if (mErr) {
            console.error(`Error matches for ${league} (ID: ${mappedMatchLeagueId}):`, mErr);
        } else {
            console.log(`Matches: ${matches.length} entries.`);
            const mockCount = matches.filter(m => m.id.startsWith(league.substring(0, 3)) || m.id.startsWith('lib-') || m.id.startsWith('prem-') || m.id.startsWith('liga-') || m.id.startsWith('ucl-')).length;
            console.log(`Mock matches (custom ID prefix): ${mockCount}`);
        }
    }
}

inspect();
