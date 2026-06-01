import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspect() {
    const { data: match, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', '1544371')
        .single();

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("UCL Final Match Record:", JSON.stringify(match, null, 2));
    }
}

inspect();
