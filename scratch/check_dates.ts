import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data } = await supabase.from('matches').select('id, home_team, away_team, start_time, status').eq('id', '1539002');
  console.log('Match 1539002:', data);
  
  const { data: m1489374 } = await supabase.from('matches').select('id, home_team, away_team, start_time, status').eq('id', '1489374');
  console.log('Alemania vs Curazao:', m1489374);
}

check();
