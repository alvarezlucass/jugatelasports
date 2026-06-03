import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const { data: pvp, error: err1 } = await supabase.from('pvp_challenges').select('*');
    const { data: preds, error: err2 } = await supabase.from('predictions').select('*');
    
    console.log('PVP:', pvp?.length, err1);
    console.log('PREDS:', preds?.length, err2);
    
    if (pvp?.length > 0) {
        console.log('Last PVP:', pvp[pvp.length - 1]);
    }
    if (preds?.length > 0) {
        console.log('Last PRED:', preds[preds.length - 1]);
    }
}

check();
