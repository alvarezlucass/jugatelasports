import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing required environment variables.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    console.log('Querying matches from Supabase...');
    console.log('Querying all matches from Supabase (paginated)...');
    let matches = [];
    let start = 0;
    const limit = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('matches')
            .select('*')
            .range(start, start + limit - 1);

        if (error) {
            console.error('Error fetching matches:', error);
            process.exit(1);
        }

        matches = matches.concat(data);
        console.log(`Fetched matches ${start} to ${start + data.length - 1}...`);
        
        if (data.length < limit) {
            hasMore = false;
        } else {
            start += limit;
        }
    }


    console.log(`Checking ${matches.length} matches...`);
    let found = 0;
    const namesToCheck = ['vinicius', 'messi', 'neymar', 'richarlison', 'marquinhos', 'alisson', 'casemiro', 'paquetá', 'guimarães', 'scaloni', 'aimar', 'otamendi', 'tagliafico', 'di maría'];
    for (const match of matches) {
        const metaStr = JSON.stringify(match.metadata || {}).toLowerCase();
        const hasMockName = namesToCheck.some(name => metaStr.includes(name));
        if (hasMockName) {
            console.log(`Found match ID: ${match.id} | ${match.home_team} vs ${match.away_team} | League: ${match.league_id} | Season: ${match.season}`);
            // Check which names matched
            const matchedNames = namesToCheck.filter(name => metaStr.includes(name));
            console.log(`  Matched names: ${matchedNames.join(', ')}`);
            found++;
        }
    }
    console.log(`Found ${found} matches with mock metadata names.`);
    process.exit(0);
}

check();
