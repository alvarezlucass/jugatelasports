import { supabase } from './src/lib/supabase.ts';

async function checkSchema() {
    const { data, error } = await supabase.from('players').select('*').limit(1);
    console.log("Error:", error);
    if (data && data.length > 0) {
        console.log("Columns:", Object.keys(data[0]));
    } else {
        console.log("No data, but query success. data:", data);
        // Let's try to trigger an error by selecting a nonexistent column to see the hint
        const { error: err2 } = await supabase.from('players').select('non_existent_column').limit(1);
        console.log("Schema error hint:", err2);
    }
}

checkSchema();
