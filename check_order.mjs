import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    let query = supabase.from('matches').select('id, start_time, status').in('status', ['FINISHED']).order('start_time', { ascending: false }).limit(10);
    const { data } = await query;
    console.log("DESCENDING:");
    data.forEach(d => console.log(d.start_time));
}

run();
