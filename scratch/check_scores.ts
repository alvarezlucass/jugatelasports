import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data } = await supabase.from('matches').select('id, home_score, away_score, status').eq('id', '1489374');
  console.log('Alemania vs Curazao:', data);
}

check();
