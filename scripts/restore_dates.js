import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function restore() {
    console.log('Leyendo worldCupPersistence.ts...');
    const content = fs.readFileSync('src/data/worldCupPersistence.ts', 'utf8');
    
    // Extract matches using regex
    const matchesRegex = /{ id: '(.*?)', group: '(.*?)', homeTeam: '(.*?)', awayTeam: '(.*?)', date: '(.*?)', time: '(.*?)', stadium: '(.*?)', city: '(.*?)', status: '(.*?)'(?:, homeScore: (.*?), awayScore: (.*?))? }/g;
    let match;
    const updates = [];

    while ((match = matchesRegex.exec(content)) !== null) {
        const id = match[1];
        const date = match[5];
        const time = match[6];
        const startTime = `${date}T${time}:00Z`;
        
        updates.push({
            id,
            start_time: startTime
        });
    }

    console.log(`Restaurando fechas para ${updates.length} partidos...`);

    for (const update of updates) {
        await supabase.from('matches').update({ start_time: update.start_time }).eq('id', update.id);
    }

    console.log('Restauración completa.');
}

restore();
