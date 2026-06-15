import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: dbMatches, error } = await supabase
    .from('matches')
    .select('id, home_team, away_team')
    .eq('league_id', 'world-cup-2026');

  if (error) {
    console.error('Error fetching matches:', error);
    process.exit(1);
  }

  const filePath = 'src/data/worldCupPersistence.ts';
  let content = fs.readFileSync(filePath, 'utf8');

  // We need to map the DB names which might be in English to the Spanish names used in the file
  const DB_TO_SPANISH: Record<string, string> = {
            "Germany": "Alemania",
            "Saudi Arabia": "Arabia Saudita",
            "Algeria": "Argelia",
            "Argentina": "Argentina",
            "Australia": "Australia",
            "Austria": "Austria",
            "Belgium": "Bélgica",
            "Bosnia & Herzegovina": "Bosnia",
            "Brazil": "Brasil",
            "Cape Verde Islands": "Cabo Verde",
            "Canada": "Canadá",
            "Colombia": "Colombia",
            "South Korea": "Corea del Sur",
            "Ivory Coast": "Costa de Marfil",
            "Croatia": "Croacia",
            "Curaçao": "Curazao",
            "Ecuador": "Ecuador",
            "Egypt": "Egipto",
            "Scotland": "Escocia",
            "Spain": "España",
            "France": "Francia",
            "Ghana": "Ghana",
            "Haiti": "Haití",
            "Iraq": "Irak",
            "Iran": "Irán",
            "England": "Inglaterra",
            "Japan": "Japón",
            "Jordan": "Jordania",
            "Morocco": "Marruecos",
            "Mexico": "México",
            "Norway": "Noruega",
            "New Zealand": "Nueva Zelanda",
            "Netherlands": "Países Bajos",
            "Panama": "Panamá",
            "Paraguay": "Paraguay",
            "Portugal": "Portugal",
            "Qatar": "Qatar",
            "Congo DR": "RD Congo",
            "Czech Republic": "República Checa",
            "Senegal": "Senegal",
            "South Africa": "Sudáfrica",
            "Sweden": "Suecia",
            "Switzerland": "Suiza",
            "Tunisia": "Túnez",
            "Turkey": "Turquía",
            "Uruguay": "Uruguay",
            "USA": "USA",
            "Uzbekistan": "Uzbekistán"
  };

  let replacements = 0;

  for (const match of dbMatches) {
    const homeEs = DB_TO_SPANISH[match.home_team] || match.home_team;
    const awayEs = DB_TO_SPANISH[match.away_team] || match.away_team;
    
    // Find a line like: { id: 'm4', group: 'A', homeTeam: 'Sudáfrica', awayTeam: 'República Checa',
    // We can use a regex to match the homeTeam and awayTeam exactly
    const regex = new RegExp(`{\\s*id:\\s*'m\\d+',\\s*group:\\s*'[^']+',\\s*homeTeam:\\s*'${homeEs}',\\s*awayTeam:\\s*'${awayEs}'`, 'g');
    
    const matchLine = content.match(regex);
    if (matchLine) {
        // Replace id: 'mXX' with id: 'realID'
        const oldIdMatch = matchLine[0].match(/id:\s*'m\d+'/);
        if (oldIdMatch) {
            const newSnippet = matchLine[0].replace(oldIdMatch[0], `id: '${match.id}'`);
            content = content.replace(matchLine[0], newSnippet);
            replacements++;
            console.log(`Updated ${homeEs} vs ${awayEs} -> ID: ${match.id}`);
        }
    } else {
        // sometimes there's a typo, let's try a broader regex for any mXX ID with those teams
        const looseRegex = new RegExp(`{\\s*id:\\s*'m\\d+'[^{]*?homeTeam:\\s*'${homeEs}'[^{]*?awayTeam:\\s*'${awayEs}'`);
        const matchLine2 = content.match(looseRegex);
        if (matchLine2) {
             const oldIdMatch = matchLine2[0].match(/id:\s*'m\d+'/);
             if (oldIdMatch) {
                const newSnippet = matchLine2[0].replace(oldIdMatch[0], `id: '${match.id}'`);
                content = content.replace(matchLine2[0], newSnippet);
                replacements++;
                console.log(`Updated ${homeEs} vs ${awayEs} -> ID: ${match.id}`);
             }
        }
    }
  }

  if (replacements > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully updated ${replacements} matches in worldCupPersistence.ts`);
  } else {
    console.log('No matches to update or matches not found.');
  }
}

run();
