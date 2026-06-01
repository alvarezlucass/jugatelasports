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
    console.log("Searching for teams containing 'Colo' in the database:");
    const { data: teams, error } = await supabase
        .from('teams')
        .select('id, name, logo')
        .ilike('name', '%Colo%');

    if (error) {
        console.error("Error:", error);
    } else {
        console.log(`Found ${teams.length} teams:`);
        teams.forEach(t => {
            console.log(`- ID: ${t.id}, Name: ${t.name}, Logo: ${t.logo}`);
        });
    }
}

inspect();
