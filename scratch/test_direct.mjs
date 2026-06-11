import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase
                .from('matches')
                .select('*')
                .eq('id', 'm1')
                .single();
    if (error) console.log("ERROR", error);
    else console.log("DB DATA metadata.ai_prediction:", data.metadata.ai_prediction);
}
run();
