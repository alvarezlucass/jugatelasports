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
    console.log("Fetching all entries from 'leagues' table:");
    const { data: leagues, error } = await supabase
        .from('leagues')
        .select('*');

    if (error) {
        console.error("Error:", error);
    } else {
        console.log(`Found ${leagues.length} leagues:`);
        leagues.forEach(l => {
            console.log(`- ID: ${l.id}, API_ID: ${l.api_id}, Name: ${l.name}, Country: ${l.country}, Active: ${l.is_active}, Metadata:`, l.metadata);
        });
    }
}

inspect();
