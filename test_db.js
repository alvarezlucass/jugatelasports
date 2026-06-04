import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

    const { data: pvp, error: err1 } = await supabase.from('pvp_challenges').insert({
        creator_id: 'test-user',
        creator_name: 'test',
        target_id: 'ai-ia',
        target_name: 'AI',
        match_id: '123',
        match_home_team: 'A',
        match_away_team: 'B',
        amount: 5,
        creator_selection: 'HOME',
        creator_home_score: 1,
        creator_away_score: 0,
        target_selection: 'AWAY',
        target_home_score: 0,
        target_away_score: 1,
        status: 'ACCEPTED'
    });
    
    console.log('PVP INSERT ERROR:', err1);
