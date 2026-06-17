import { createClient } from '@supabase/supabase-js';

const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
s.from('matches').select('id,home_team,away_team,status,api_id,home_score,away_score,date').in('status',['LIVE','IN_PLAY','1H','2H','HT','NS','UPCOMING']).then(r => {
    console.log("Stuck matches:", JSON.stringify(r.data, null, 2));
    process.exit(0);
});
