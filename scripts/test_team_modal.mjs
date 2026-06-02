import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
    console.log("Fetching match 1545443...");
    const { data: match, error: mError } = await supabase.from('matches').select('*').eq('id', '1545443').single();
    if (mError) {
        console.error("Match error:", mError);
        return;
    }
    console.log("Match home_id:", match.home_id);
    console.log("Match away_id:", match.away_id);
    
    if (!match.home_id) {
        console.log("No home_id on this match!");
        return;
    }

    console.log("Fetching team", match.home_id, "...");
    try {
        const { data: team, error: tError } = await supabase.from('teams').select('*').eq('id', match.home_id).single();
        if (tError) {
            console.error("Team error:", tError);
            return;
        }
        console.log("Team found:", team.name);
    } catch(e) {
        console.error("Caught error:", e);
    }
}
test();
