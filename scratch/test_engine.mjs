import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testEngine() {
    const { enhanceMatchWithDynamicData } = await import('../src/services/predictionEngine.ts');
    const { data: m1 } = await supabase.from('matches').select('*').eq('id', 'm1').single();
    const result = await enhanceMatchWithDynamicData(m1);
    console.log(JSON.stringify(result.metadata.ai_prediction, null, 2));
}
testEngine();
