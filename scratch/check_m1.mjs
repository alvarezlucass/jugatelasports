import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkMatch() {
    const { data } = await supabase.from('matches').select('*').eq('id', 'm1').single();
    console.log(JSON.stringify(data.metadata.ai_prediction, null, 2));
}
checkMatch();
