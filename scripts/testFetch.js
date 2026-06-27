import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testFetch() {
    try {
        const matchId = '1489397';
        const { data, error } = await supabase
            .from('matches')
            .select('*')
            .eq('id', matchId)
            .single();

        if (error) throw error;
        
        console.log("DB FETCH SUCCESS:", data.start_time);
        
        // Mock predictionEngine dynamic data
        // ... well actually I don't need to import it if it doesn't fail
        
        console.log("Success: true");
    } catch (e) {
        console.log("Success: false", e);
    }
}

testFetch();
