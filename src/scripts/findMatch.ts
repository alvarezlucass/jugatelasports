import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function findMatch() {
  const { data, error } = await supabase
    .from('predictions')
    .select('match_id')
    .eq('status', 'PENDING')
    .limit(1);
  
  if (error) console.error(error);
  else console.log('Found match ID:', data);
}

findMatch();
