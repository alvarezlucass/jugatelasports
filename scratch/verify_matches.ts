import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// We'll read the matches directly from the TS file by parsing it
// since importing TS directly might be tricky in this scratch script
const content = fs.readFileSync('src/data/worldCupPersistence.ts', 'utf8');

// Extract the WORLD_CUP_GROUP_MATCHES array content
const matchesSection = content.substring(content.indexOf('WORLD_CUP_GROUP_MATCHES: GroupMatch[] = ['), content.indexOf('];', content.indexOf('WORLD_CUP_GROUP_MATCHES')));

const tsMatches: { id: string, group: string, homeTeam: string, awayTeam: string }[] = [];

// Simple regex to extract matches
const regex = /{ id: ['"]([^'"]+)['"], group: ['"]([^'"]+)['"], homeTeam: ['"]([^'"]+)['"], awayTeam: ['"]([^'"]+)['"]/g;
let match;
while ((match = regex.exec(matchesSection)) !== null) {
  tsMatches.push({
    id: match[1],
    group: match[2],
    homeTeam: match[3],
    awayTeam: match[4]
  });
}

const DB_TO_SPANISH: Record<string, string> = {
            "Germany": "Alemania", "Saudi Arabia": "Arabia Saudita", "Algeria": "Argelia", "Argentina": "Argentina",
            "Australia": "Australia", "Austria": "Austria", "Belgium": "Bélgica", "Bosnia & Herzegovina": "Bosnia",
            "Brazil": "Brasil", "Cape Verde Islands": "Cabo Verde", "Canada": "Canadá", "Colombia": "Colombia",
            "South Korea": "Corea del Sur", "Ivory Coast": "Costa de Marfil", "Croatia": "Croacia", "Curaçao": "Curazao",
            "Ecuador": "Ecuador", "Egypt": "Egipto", "Scotland": "Escocia", "Spain": "España", "France": "Francia",
            "Ghana": "Ghana", "Haiti": "Haití", "Iraq": "Irak", "Iran": "Irán", "England": "Inglaterra",
            "Japan": "Japón", "Jordan": "Jordania", "Morocco": "Marruecos", "Mexico": "México", "Norway": "Noruega",
            "New Zealand": "Nueva Zelanda", "Netherlands": "Países Bajos", "Panama": "Panamá", "Paraguay": "Paraguay",
            "Portugal": "Portugal", "Qatar": "Qatar", "Congo DR": "RD Congo", "Czech Republic": "República Checa",
            "Senegal": "Senegal", "South Africa": "Sudáfrica", "Sweden": "Suecia", "Switzerland": "Suiza",
            "Tunisia": "Túnez", "Turkey": "Turquía", "Uruguay": "Uruguay", "USA": "USA", "Uzbekistan": "Uzbekistán"
};

async function run() {
  console.log(`Expected matches in code: ${tsMatches.length} (Should be 72)`);
  
  const { data: dbMatches, error } = await supabase
    .from('matches')
    .select('id, home_team, away_team')
    .eq('league_id', 'world-cup-2026');

  if (error) {
    console.error('Error fetching matches:', error);
    process.exit(1);
  }

  console.log(`Matches found in DB for World Cup: ${dbMatches.length}`);

  let missingInDb = 0;
  let mismatchedTeams = 0;
  let matchesWithM = 0;

  console.log('\n--- VERIFICACIÓN DE PARTIDOS ---');
  
  for (const m of tsMatches) {
     if (m.id.startsWith('m')) {
         console.log(`[ATENCIÓN] En el código hay un ID que empieza con 'm': ${m.id} (${m.homeTeam} vs ${m.awayTeam})`);
         matchesWithM++;
     }

     // Buscar en DB por ID
     const dbMatchById = dbMatches.find(dbm => dbm.id === m.id);
     
     if (!dbMatchById) {
         console.log(`[FALTA EN DB] El partido ID ${m.id} (${m.homeTeam} vs ${m.awayTeam} - Grupo ${m.group}) NO ESTÁ en la base de datos.`);
         
         // Buscar si existe con las mismas selecciones pero con otro ID
         const alternativeMatch = dbMatches.find(dbm => {
             const h = DB_TO_SPANISH[dbm.home_team] || dbm.home_team;
             const a = DB_TO_SPANISH[dbm.away_team] || dbm.away_team;
             return (h === m.homeTeam && a === m.awayTeam) || (h === m.awayTeam && a === m.homeTeam);
         });
         
         if (alternativeMatch) {
             console.log(`  -> Pero encontré otro partido con esos equipos en la DB: ID ${alternativeMatch.id} (${alternativeMatch.home_team} vs ${alternativeMatch.away_team})`);
         }
         
         missingInDb++;
     } else {
         // Existe el ID, verificamos si los equipos coinciden
         const dbH = DB_TO_SPANISH[dbMatchById.home_team] || dbMatchById.home_team;
         const dbA = DB_TO_SPANISH[dbMatchById.away_team] || dbMatchById.away_team;
         
         if (dbH !== m.homeTeam || dbA !== m.awayTeam) {
             console.log(`[DISCREPANCIA] ID ${m.id}: El código espera ${m.homeTeam} vs ${m.awayTeam}, pero la DB tiene ${dbH} vs ${dbA}`);
             mismatchedTeams++;
         }
     }
  }

  console.log('\n--- RESUMEN ---');
  console.log(`Total Esperados: ${tsMatches.length}`);
  console.log(`Faltan en DB: ${missingInDb}`);
  console.log(`Discrepancia de Equipos: ${mismatchedTeams}`);
  console.log(`IDs temporales (mXX) en código: ${matchesWithM}`);

}

run();
