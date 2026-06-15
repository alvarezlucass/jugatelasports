import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const teams = [
      "Bosnia", "Suiza", "Marruecos", "Escocia", "Paraguay", "Turquía", 
      "Curazao", "Ecuador", "Japón", "Túnez", "Egipto", "Nueva Zelanda", 
      "Cabo Verde", "Uruguay", "Senegal", "Noruega", "Argelia", "Jordania",
      "RD Congo", "Colombia", "Croacia", "Panamá", "Sudáfrica", "República Checa"
  ];
  
  const { data: dbMatches, error } = await supabase
    .from('matches')
    .select('id, home_team, away_team')
    .eq('league_id', 'world-cup-2026');

  if (error) {
    console.error('Error fetching matches:', error);
    process.exit(1);
  }

  dbMatches.forEach(m => {
    if (teams.includes(m.home_team) || teams.includes(m.away_team)) {
        console.log(`DB Match: ${m.home_team} vs ${m.away_team} -> ID: ${m.id}`);
    }
  });
}

run();
