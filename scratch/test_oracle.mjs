import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function enhanceMatchWithDynamicData(matchData) {
    if (!matchData) return matchData;
    const homeName = matchData.home_team;
    const awayName = matchData.away_team;
    const matchId = matchData.id;
    if (!matchData.metadata) matchData.metadata = {};

    const { data: homeRecent, error } = await supabase
        .from('matches')
        .select('home_team, away_team, home_score, away_score')
        .or('home_team.eq."' + homeName + '",away_team.eq."' + homeName + '"')
        .eq('status', 'FINISHED')
        .neq('id', matchId)
        .not('home_score', 'is', null)
        .order('start_time', { ascending: false })
        .limit(5);

    console.log("homeRecent for", homeName, ":", homeRecent);
    console.log("error for", homeName, ":", error);
}

async function testOracle() {
    const { data: m1 } = await supabase.from('matches').select('*').eq('id', 'm1').single();
    await enhanceMatchWithDynamicData(m1);
}
testOracle();
