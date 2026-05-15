import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function seed() {
  console.log('🌱 Seeding test data...');
  
  // 1. Create a test profile
  const testUserId = '00000000-0000-0000-0000-000000000000'; // Using a static UUID for testing if possible or let trigger handle it
  // Actually, handle_new_user trigger works on auth.users. 
  // For simulation we can just insert directly into profiles if RLS allows (it might if using anon key with open rules, or service role)
  
  const { data: profile, error: pError } = await supabase
    .from('profiles')
    .upsert({
      id: 'd8f8d8f8-d8f8-d8f8-d8f8-d8f8d8f8d8f8',
      username: 'tester_prode',
      full_name: 'Industrial Tester',
      total_balance: 1000
    }, { onConflict: 'id' })
    .select();

  if (pError) console.error('Error seeding profile:', pError);
  else console.log('✅ Profile seeded:', profile[0].username);

  // 2. Create a test match
  const { data: match, error: mError } = await supabase
    .from('matches')
    .upsert({
      id: 'test-match-1',
      home_team: 'Argentina',
      away_team: 'Francia',
      status: 'SCHEDULED',
      start_time: new Date().toISOString()
    }, { onConflict: 'id' })
    .select();

  if (mError) console.error('Error seeding match:', mError);
  else console.log('✅ Match seeded:', match[0].id);

  // 3. Create a test prediction
  const { data: pred, error: prError } = await supabase
    .from('predictions')
    .upsert({
      user_id: 'd8f8d8f8-d8f8-d8f8-d8f8-d8f8d8f8d8f8',
      match_id: 'test-match-1',
      home_score_pred: 2,
      away_score_pred: 1,
      selection: 'HOME',
      stake: 10,
      potential_return: 20,
      status: 'PENDING'
    })
    .select();

  if (prError) console.error('Error seeding prediction:', prError);
  else console.log('✅ Prediction seeded:', pred[0].id);
}

seed();
