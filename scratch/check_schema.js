import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkSchema() {
    console.log("Checking tables...");
    const { data: players } = await supabase.from('players').select('*').limit(1);
    console.log("Players columns:", players && players.length > 0 ? Object.keys(players[0]) : "No players found or empty");

    const { data: matches } = await supabase.from('matches').select('*').limit(1);
    console.log("Matches columns:", matches && matches.length > 0 ? Object.keys(matches[0]) : "No matches found or empty");

    const { data: standings } = await supabase.from('standings').select('*').limit(1);
    console.log("Standings columns:", standings && standings.length > 0 ? Object.keys(standings[0]) : "No standings found or empty");

    // Check if player_transfers or similar exist
    const { data: transfers, error } = await supabase.from('player_transfers').select('*').limit(1);
    console.log("player_transfers exists?", error ? "No" : "Yes");
}
checkSchema();
