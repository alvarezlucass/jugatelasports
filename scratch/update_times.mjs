import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const matchesToSync = [
    { id: 'm1', start_time: '2026-06-11T19:00:00Z' },
    { id: 'm2', start_time: '2026-06-12T02:00:00Z' },
    { id: 'm7', start_time: '2026-06-12T19:00:00Z' },
    { id: 'm8', start_time: '2026-06-13T19:00:00Z' },
    { id: 'm13', start_time: '2026-06-13T22:00:00Z' },
    { id: 'm19', start_time: '2026-06-13T01:00:00Z' }
];

async function update() {
    for (const m of matchesToSync) {
        await supabase.from('matches').update({ start_time: m.start_time }).eq('id', m.id);
        console.log('Updated ' + m.id);
    }
}
update();
