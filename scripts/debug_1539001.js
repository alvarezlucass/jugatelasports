import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const API_FOOTBALL_KEY = process.env.VITE_API_FOOTBALL_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
    const { data: dbMatch } = await supabase.from('matches').select('*').eq('id', '1539001').single();
    
    console.log('DB Match:', dbMatch);

    const res = await fetch(`https://v3.football.api-sports.io/fixtures?id=1539001`, {
        headers: { 'x-apisports-key': API_FOOTBALL_KEY }
    });
    const data = await res.json();
    
    const fixtureData = data.response[0];
    const fixture = fixtureData.fixture;
    const goals = fixtureData.goals;
    const shortStatus = fixture.status.short;

    console.log('API Status:', shortStatus, 'Goals:', goals);
    
    let newStatus = dbMatch.status;
    if (['FT', 'AET', 'PEN'].includes(shortStatus)) newStatus = 'FINISHED';
    else if (['1H', 'HT', '2H', 'ET', 'BT', 'P', 'INT'].includes(shortStatus)) newStatus = 'LIVE';
    else if (['CANC', 'PST', 'ABD'].includes(shortStatus)) newStatus = 'CANCELLED';
    else if (['NS', 'TBD'].includes(shortStatus)) newStatus = 'SCHEDULED';

    console.log('New Status:', newStatus, 'Old Status:', dbMatch.status);

    const newStartTime = fixture.date; // ISO format

    const updates = {};
    let changed = false;

    if (newStatus !== dbMatch.status) {
        updates.status = newStatus;
        changed = true;
    }

    if (newStartTime && new Date(newStartTime).getTime() !== new Date(dbMatch.start_time).getTime()) {
        updates.start_time = newStartTime;
        changed = true;
    }

    if (goals.home !== null && goals.home !== dbMatch.home_score) {
        updates.home_score = goals.home;
        changed = true;
    }

    if (goals.away !== null && goals.away !== dbMatch.away_score) {
        updates.away_score = goals.away;
        changed = true;
    }
    
    console.log('Changed:', changed, 'Updates:', updates);

    if (changed) {
        updates.updated_at = new Date().toISOString();
        const r = await supabase.from('matches').update(updates).eq('id', dbMatch.id);
        console.log('Update result:', r);
    }
}

test();
