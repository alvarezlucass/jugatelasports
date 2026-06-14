import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const API_FOOTBALL_KEY = process.env.VITE_API_FOOTBALL_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
    const { data: dbMatch } = await supabase.from('matches').select('*').eq('id', '1489372').single();
    
    console.log('DB Match:', dbMatch);

    const res = await fetch(`https://v3.football.api-sports.io/fixtures?id=1489372`, {
        headers: { 'x-apisports-key': API_FOOTBALL_KEY }
    });
    const data = await res.json();
    
    const fixtureData = data.response[0];
    const fixture = fixtureData.fixture;
    const goals = fixtureData.goals;
    const shortStatus = fixture.status.short;

    console.log('API Status:', shortStatus, 'Goals:', goals);
}

test();
