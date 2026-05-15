import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function listPending() {
  const { data, error } = await supabase
    .from('predictions')
    .select('match_id, count(*)')
    .eq('status', 'PENDING')
    .group('match_id');
  
  if (error) console.error(error);
  else console.log('Pending predictions by match:', data);
}

listPending();
