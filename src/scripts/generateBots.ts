import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fakerES as faker } from '@faker-js/faker';

// Load environment variables from .env
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateBots(count: number = 100) {
  console.log(`🤖 Generating ${count} bots...`);
  
  const bots = [];
  for (let i = 0; i < count; i++) {
    const id = faker.string.uuid();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const nickname = faker.internet.username({ firstName, lastName }).toLowerCase();
    
    bots.push({
      id,
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
      nickname: nickname,
      nickname_is_public: true,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
      total_balance: faker.number.int({ min: 500, max: 5000 }),
      points: faker.number.int({ min: 0, max: 2000 }),
      level: faker.number.int({ min: 1, max: 15 }),
      role: 'USER',
      is_bot: true,
      email: `${nickname}@bot.jugatelasports.com` // Optional, in case you need it
    });
  }

  // Insert in batches of 50 to avoid payload too large errors
  const batchSize = 50;
  let successCount = 0;

  for (let i = 0; i < bots.length; i += batchSize) {
    const batch = bots.slice(i, i + batchSize);
    
    // We insert directly into profiles. 
    // Ensure RLS allows inserts or use Service Role Key if possible.
    const { error } = await supabase.from('profiles').upsert(batch, { onConflict: 'id' });
    
    if (error) {
      console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
    } else {
      console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} bots)`);
      successCount += batch.length;
    }
  }

  console.log(`🎉 Bot generation complete! Successfully added ${successCount} bots.`);
}

// You can pass a different number to generate more or fewer bots
generateBots(100);
