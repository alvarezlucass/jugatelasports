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
    const realIds = [435, 451, 121, 127, 124, 130, 126, 1148]; // River, Boca, Palmeiras, Flamengo, Fluminense, Mineiro, Sao Paulo, Colo Colo
    
    console.log("Checking real team IDs in 'teams' table:");
    const { data: teams, error } = await supabase
        .from('teams')
        .select('id, name, logo')
        .in('id', realIds);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log(`Found ${teams.length} of ${realIds.length} teams.`);
        teams.forEach(t => {
            console.log(`- ID: ${t.id}, Name: ${t.name}, Logo: ${t.logo}`);
        });
        
        const missing = realIds.filter(id => !teams.some(t => t.id === id));
        console.log("Missing real team IDs:", missing);
    }
}

inspect();
