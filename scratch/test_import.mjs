import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data } = await supabase.from('matches').select('*').eq('id', 'm1').single();
    console.log("From DB:", data.metadata.ai_prediction ? "Exists" : "Null");

    // Load engine exactly as client does
    const { enhanceMatchWithDynamicData } = await import('file:///' + process.cwd().replace(/\\/g, '/') + '/src/services/predictionEngine.ts');
    
    const enhancedData = await enhanceMatchWithDynamicData(data);
    console.log("After enhance:", enhancedData.metadata?.ai_prediction ? "Exists" : "Null");
}
run();
