import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan las credenciales de Supabase (VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY)");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function ping() {
  console.log("Haciendo ping a Supabase para mantener el proyecto activo...");
  // Hacemos una consulta muy ligera (por ejemplo, buscar 1 fila en 'matches')
  const { data, error } = await supabase.from('matches').select('id').limit(1);
  
  if (error) {
    console.error("Error haciendo ping a la base de datos:", error.message);
    process.exit(1);
  }
  
  console.log("¡Ping exitoso! La base de datos registró actividad.");
}

ping();
