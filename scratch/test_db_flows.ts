import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars.');
    process.exit(1);
}

// Credentials for the active confirmed user
const TEST_EMAIL = 'admin@jugatelasports.com';
const TEST_PASSWORD = '@Marte2026';

// Other user to test write restrictions
const OTHER_USER_ID = '8b07d6e1-b259-4e72-b83c-8b0406e66b28'; // leyendasanimadas.ai@gmail.com

async function runTests() {
    console.log('--- STARTING FLOW AND SECURITY RLS TESTS (ADMIN/USER SIMULATED) ---');

    // 1. Initialize anonymous client
    console.log('\n[TEST 1] Initializing Anon Client...');
    const client = createClient(supabaseUrl, supabaseKey);

    // 2. Fetch leagues and matches as anonymous (Should succeed)
    console.log('[TEST 2] Fetching leagues as anonymous...');
    const { data: leagues, error: leaguesErr } = await client.from('leagues').select('*').limit(5);
    if (leaguesErr) {
        console.error('❌ Failed to fetch leagues as anon:', leaguesErr.message);
    } else {
        console.log(`✅ Successfully fetched ${leagues?.length} leagues as anon. Sample:`, leagues?.map(l => l.name));
    }

    console.log('[TEST 3] Fetching matches as anonymous...');
    const { data: matches, error: matchesErr } = await client.from('matches').select('*').limit(5);
    if (matchesErr) {
        console.error('❌ Failed to fetch matches as anon:', matchesErr.message);
    } else {
        console.log(`✅ Successfully fetched ${matches?.length} matches as anon. Sample:`, matches?.map(m => `${m.home_team} vs ${m.away_team}`));
    }

    // 3. Sign In active user
    console.log('\n[TEST 4] Authenticating with Supabase...');
    const { data: authData, error: authErr } = await client.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
    });

    if (authErr || !authData.user) {
        console.error('❌ Sign in failed:', authErr?.message);
        process.exit(1);
    }

    const myUserId = authData.user.id;
    console.log('✅ Successfully authenticated. User ID:', myUserId);

    try {
        // Demote self to USER to test RLS policies
        console.log('\n[PRE-TEST] Demoting self to USER to test regular user flow...');
        const { error: demoteErr } = await client
            .from('profiles')
            .update({ role: 'USER' })
            .eq('id', myUserId);
        
        if (demoteErr) throw new Error('Could not demote self: ' + demoteErr.message);
        console.log('✅ Demoted to USER.');

        // 4. Try to submit a prediction (Should succeed because it's their own)
        console.log('\n[TEST 5] Submitting a prediction as regular USER...');
        const firstMatch = matches?.[0];
        if (!firstMatch) {
            console.error('❌ Cannot run prediction test: No matches found in DB.');
        } else {
            const { data: predData, error: predErr } = await client.from('predictions').insert({
                user_id: myUserId,
                match_id: firstMatch.id,
                selection: 'HOME',
                stake: 10.0,
                potential_return: 23.0
            }).select();

            if (predErr) {
                console.error('❌ Failed to insert prediction as USER:', predErr.message);
            } else {
                console.log('✅ Prediction submitted successfully:', predData);
                // Cleanup
                await client.from('predictions').delete().eq('id', predData[0].id);
                console.log('Cleaned up test prediction.');
            }
        }

        // 5. Security check: Try to update other user profile (Should fail due to RLS)
        console.log('\n[TEST 6] Security Check: Attempting to update other user\'s profile role as regular USER...');
        const { data: hackData, error: hackErr } = await client
            .from('profiles')
            .update({ role: 'ADMIN' })
            .eq('id', OTHER_USER_ID)
            .select();

        if (hackErr) {
            console.log('✅ RLS blocked the update as expected! Error:', hackErr.message);
        } else if (hackData && hackData.length > 0) {
            console.error('❌ SECURITY VULNERABILITY! Regular user updated another profile:', hackData);
        } else {
            console.log('✅ RLS blocked/ignored the update (no rows returned/updated).');
        }

        // 6. Security check: Try to write/delete leagues as regular USER (Should fail)
        console.log('\n[TEST 7] Security Check: Attempting to delete a league as regular USER...');
        const { data: deleteLeagueData, error: deleteLeagueErr } = await client
            .from('leagues')
            .delete()
            .eq('id', 'ucl')
            .select();

        if (deleteLeagueErr) {
            console.log('✅ RLS blocked the delete as expected! Error:', deleteLeagueErr.message);
        } else if (deleteLeagueData && deleteLeagueData.length > 0) {
            console.error('❌ SECURITY VULNERABILITY! Regular user deleted league:', deleteLeagueData);
        } else {
            console.log('✅ RLS blocked/ignored the delete (no rows returned/deleted).');
        }

        // 7. Store Purchase flow test
        console.log('\n[TEST 8] Testing Store Item Purchase Flow as regular USER...');
        const { data: storeItems, error: storeErr } = await client.from('store_items').select('*').limit(1);
        const itemToBuy = storeItems?.[0];
        if (storeErr || !itemToBuy) {
            console.error('❌ Failed to fetch store items for purchase:', storeErr?.message);
        } else {
            console.log(`Attempting to purchase: ${itemToBuy.name} for ${itemToBuy.price} tokens...`);
            
            // Get current balance
            const { data: currentProf } = await client.from('profiles').select('total_balance').eq('id', myUserId).single();
            const userBalance = currentProf ? Number(currentProf.total_balance) : 1000;

            // Spend transaction
            const { data: tx, error: txErr } = await client.from('transactions').insert({
                user_id: myUserId,
                type: 'REWARD_REDEEM',
                amount: -itemToBuy.price,
                description: `Compra: ${itemToBuy.name}`,
                balance_after: userBalance - itemToBuy.price
            }).select().single();

            if (txErr) {
                console.error('❌ Transaction insert failed:', txErr.message);
            } else {
                console.log('✅ Spend transaction logged:', tx.id);
                // Upsert inventory
                const { error: invErr } = await client.from('user_inventory').upsert({
                    user_id: myUserId,
                    item_id: itemToBuy.id,
                    quantity: 1
                });
                if (invErr) {
                    console.error('❌ Inventory upsert failed:', invErr.message);
                } else {
                    console.log('✅ Inventory updated successfully!');
                }

                // Cleanup test inventory & transaction
                await client.from('user_inventory').delete().eq('user_id', myUserId).eq('item_id', itemToBuy.id);
                await client.from('transactions').delete().eq('id', tx.id);
                console.log('Cleaned up test purchase.');
            }
        }

    } finally {
        // Promote self back to ADMIN
        console.log('\n[POST-TEST] Restoring ADMIN role...');
        const { error: restoreErr } = await client
            .from('profiles')
            .update({ role: 'ADMIN' })
            .eq('id', myUserId);
        
        if (restoreErr) {
            console.error('❌ Failed to restore ADMIN role! Manual database fix might be required:', restoreErr.message);
        } else {
            console.log('✅ Restored ADMIN role successfully.');
        }
    }

    console.log('\n--- ALL FLOW AND SECURITY TESTS COMPLETED ---');
}

runTests();
