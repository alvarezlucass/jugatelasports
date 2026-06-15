import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('matches').select('*').eq('id', '1489380');
  console.log('Match 1489380:', data);

  const { data: m70 } = await supabase.from('matches').select('*').eq('id', 'm70');
  console.log('Match m70:', m70);
  
  const { data: m1489403 } = await supabase.from('matches').select('*').eq('id', '1489403');
  console.log('Match 1489403:', m1489403);
}

check();
