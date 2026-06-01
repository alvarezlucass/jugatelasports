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

const ADMIN_EMAIL = 'admin@jugatelasports.com';
const ADMIN_PASSWORD = '@Marte2026';

async function authenticateAsAdmin() {
    console.log('Authenticating as admin...');
    const { error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });
    if (error) {
        console.error('Failed to authenticate as admin:', error.message);
        process.exit(1);
    }
    console.log('Authenticated as Admin.');
}

async function run() {
    await authenticateAsAdmin();

    const mockTeamIds = [
        // UCL
        501, 502, 503, 504, 505, 506, 507, 508,
        // Premier
        601, 602, 603, 604, 605, 606, 607, 608,
        // La Liga
        701, 702, 703, 704, 705, 706, 707, 708,
        // Libertadores
        801, 802, 803, 804, 805, 806, 807, 808
    ];

    console.log(`Starting thorough cleanup of mock teams ${mockTeamIds.join(', ')}...`);

    // 1. Delete standings entries referencing these team IDs
    const { error: sErr } = await supabase
        .from('standings')
        .delete()
        .in('team_id', mockTeamIds);

    if (sErr) {
        console.error('Error deleting mock standings:', sErr.message);
    } else {
        console.log(`Successfully deleted mock standings entries.`);
    }

    // 2. Delete league-team relations referencing these team IDs
    const { error: rErr } = await supabase
        .from('league_teams')
        .delete()
        .in('team_id', mockTeamIds);

    if (rErr) {
        console.error('Error deleting mock relations:', rErr.message);
    } else {
        console.log(`Successfully deleted mock league_teams relations.`);
    }

    // 3. Delete mock teams from teams table
    const { error: tErr } = await supabase
        .from('teams')
        .delete()
        .in('id', mockTeamIds);

    if (tErr) {
        console.error('Error deleting mock teams:', tErr.message);
    } else {
        console.log(`Successfully deleted mock teams.`);
    }

    console.log('Cleanup completed successfully.');
    process.exit(0);
}

run();
