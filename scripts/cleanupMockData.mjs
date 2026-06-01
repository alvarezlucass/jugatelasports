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

async function cleanup() {
    await authenticateAsAdmin();
    
    console.log('Fetching matches to check for mock IDs...');
    const { data: matches, error: fetchError } = await supabase
        .from('matches')
        .select('id, home_team, away_team');
        
    if (fetchError) {
        console.error('Failed to fetch matches:', fetchError.message);
        process.exit(1);
    }
    
    // Filter matches with non-numeric IDs
    const mockMatchIds = matches
        .filter(m => !/^\d+$/.test(m.id))
        .map(m => m.id);
        
    console.log(`Found ${mockMatchIds.length} mock matches to check.`);
    
    if (mockMatchIds.length === 0) {
        console.log('No mock matches found.');
        process.exit(0);
    }
    
    // 1. Delete predictions referencing mock matches first to avoid FK constraint issues
    console.log('Deleting predictions referencing mock matches...');
    const { error: predDeleteError } = await supabase
        .from('predictions')
        .delete()
        .in('match_id', mockMatchIds);
        
    if (predDeleteError) {
        console.error('Failed to delete predictions referencing mock matches:', predDeleteError.message);
    } else {
        console.log('Predictions deleted successfully.');
    }
    
    // 2. Delete matches
    console.log(`Deleting mock matches...`);
    const BATCH_SIZE = 100;
    let deletedCount = 0;
    
    for (let i = 0; i < mockMatchIds.length; i += BATCH_SIZE) {
        const batch = mockMatchIds.slice(i, i + BATCH_SIZE);
        const { error: deleteError } = await supabase
            .from('matches')
            .delete()
            .in('id', batch);
            
        if (deleteError) {
            console.error(`Failed to delete batch:`, deleteError.message);
        } else {
            deletedCount += batch.length;
            console.log(`Deleted ${deletedCount}/${mockMatchIds.length} matches...`);
        }
    }
    
    console.log('\nCleanup Complete! All mock matches and their predictions have been removed from Supabase.');
    process.exit(0);
}

cleanup();
