import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { WORLD_CUP_GROUP_MATCHES } from '../src/data/worldCupPersistence';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log(`Verificando y actualizando ${WORLD_CUP_GROUP_MATCHES.length} partidos...`);
  let updatedCount = 0;

  for (const match of WORLD_CUP_GROUP_MATCHES) {
    // Buscar el partido en DB
    const { data: dbMatch, error: fetchError } = await supabase
      .from('matches')
      .select('id, metadata')
      .eq('id', match.id)
      .single();

    if (fetchError || !dbMatch) {
      console.log(`[Error] No se encontró en DB el partido: ${match.homeTeam} vs ${match.awayTeam} (ID: ${match.id})`);
      continue;
    }

    // Actualizar o preservar metadata
    const currentMetadata = dbMatch.metadata || {};
    const newMetadata = {
      ...currentMetadata,
      group: match.group,
      stadium: match.stadium,
      city: match.city
    };

    const { error: updateError } = await supabase
      .from('matches')
      .update({ metadata: newMetadata })
      .eq('id', match.id);

    if (updateError) {
      console.error(`[Error] Falló actualización de ${match.id}:`, updateError.message);
    } else {
      updatedCount++;
      console.log(`Sincronizado Grupo ${match.group} -> ${match.homeTeam} vs ${match.awayTeam} (ID: ${match.id})`);
    }
  }

  console.log(`\n¡Sincronización completa! Se actualizaron ${updatedCount} partidos en Supabase.`);
}

run();
