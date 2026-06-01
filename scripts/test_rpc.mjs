import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRPC() {
  const { data: profiles } = await supabase.from('profiles').select('id, total_balance').limit(1);
  const user = profiles?.[0];
  
  if (!user) {
    console.error('No valid user found in profiles');
    return;
  }
  
  const userId = user.id;
  console.log(`Fetching a valid match from matches table...`);
  const { data: matchData } = await supabase.from('matches').select('id, home_team, away_team').limit(1);
  const matchId = 'm19';
  console.log(`Fetching match ${matchId} from matches table...`);
  const { data: matchData, error } = await supabase.from('matches').select('*').eq('id', matchId).single();
  
  if (error) {
    console.error('Error querying match:', error);
    return;
  }
  
  console.log(`Success! Match: ${matchData.home_team} vs ${matchData.away_team}`);
  console.log('Metadata:', matchData.metadata);
}

testRPC();
