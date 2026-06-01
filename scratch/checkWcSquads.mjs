import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const WORLD_CUP_TEAMS_HISTORY = {
    "Argentina": "ARG", "México": "MEX", "Brasil": "BRA", "España": "ESP", "USA": "USA", "Canadá": "CAN",
    "Francia": "FRA", "Alemania": "GER", "Corea del Sur": "KOR", "República Checa": "CZE", "Sudáfrica": "RSA",
    "Australia": "AUS", "Arabia Saudita": "KSA", "Bosnia": "BIH", "Qatar": "QAT", "Suiza": "SUI",
    "Haití": "HAI", "Marruecos": "MAR", "Escocia": "SCO", "Paraguay": "PAR", "Turquía": "TUR",
    "Curazao": "CUW", "Ecuador": "ECU", "Costa de Marfil": "CIV", "Países Bajos": "NED", "Japón": "JPN",
    "Suecia": "SWE", "Túnez": "TUN", "Bélgica": "BEL", "Egipto": "EGY", "Irán": "IRN", "Nueva Zelanda": "NZL",
    "Cabo Verde": "CPV", "Uruguay": "URU", "Noruega": "NOR", "Senegal": "SEN", "Irak": "IRQ", "Argelia": "ALG",
    "Austria": "AUT", "Jordania": "JOR", "Portugal": "POR", "RD Congo": "COD", "Uzbekistán": "UZB",
    "Colombia": "COL", "Inglaterra": "ENG", "Croacia": "CRO", "Ghana": "GHA", "Panamá": "PAN"
};

const SPANISH_TO_DB_TEAM_NAME = {
    "Alemania": "Germany", "Arabia Saudita": "Saudi Arabia", "Argelia": "Algeria", "Argentina": "Argentina",
    "Australia": "Australia", "Austria": "Austria", "Bélgica": "Belgium", "Bosnia": "Bosnia & Herzegovina",
    "Brasil": "Brazil", "Cabo Verde": "Cape Verde Islands", "Canadá": "Canada", "Colombia": "Colombia",
    "Corea del Sur": "South Korea", "Costa de Marfil": "Ivory Coast", "Croacia": "Croatia", "Curazao": "Curaçao",
    "Ecuador": "Ecuador", "Egipto": "Egypt", "Escocia": "Scotland", "España": "Spain", "Francia": "France",
    "Ghana": "Ghana", "Haití": "Haiti", "Irak": "Iraq", "Irán": "Iran", "Inglaterra": "England",
    "Japón": "Japan", "Jordania": "Jordan", "Marruecos": "Morocco", "México": "Mexico", "Noruega": "Norway",
    "Nueva Zelanda": "New Zealand", "Países Bajos": "Netherlands", "Panamá": "Panama", "Paraguay": "Paraguay",
    "Portugal": "Portugal", "Qatar": "Qatar", "RD Congo": "Congo DR", "República Checa": "Czech Republic",
    "Senegal": "Senegal", "Sudáfrica": "South Africa", "Suecia": "Sweden", "Suiza": "Switzerland",
    "Túnez": "Tunisia", "Turquía": "Turkey", "Uruguay": "Uruguay", "USA": "USA", "Uzbekistán": "Uzbekistan"
};

async function main() {
    console.log('Retrieving World Cup team IDs from league_teams...');
    const { data: wcRelations, error: relError } = await supabase
        .from('league_teams')
        .select('team_id')
        .eq('league_id', 'world-cup-2026');
        
    if (relError) {
        console.error('Error fetching league relations:', relError.message);
        process.exit(1);
    }
    
    const wcTeamIds = (wcRelations || []).map(r => r.team_id);
    console.log(`Found ${wcTeamIds.length} team IDs associated with world-cup-2026.`);
    
    console.log('Retrieving teams from Supabase...');
    const { data: dbTeams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, short_name')
        .in('id', wcTeamIds);
        
    if (teamsError) {
        console.error('Error fetching teams:', teamsError.message);
        process.exit(1);
    }
    
    console.log(`Retrieved ${dbTeams.length} teams in database.`);
    
    // Map teams by their short_name and name
    const teamMapByCode = {};
    const teamMapByName = {};
    dbTeams.forEach(t => {
        teamMapByCode[t.short_name] = t;
        teamMapByName[t.name.toLowerCase()] = t;
    });
    
    const results = [];
    
    for (const [spaName, code] of Object.entries(WORLD_CUP_TEAMS_HISTORY)) {
        const dbName = SPANISH_TO_DB_TEAM_NAME[spaName] || spaName;
        
        // Find DB team
        let matchedTeam = teamMapByCode[code];
        if (!matchedTeam) {
            matchedTeam = teamMapByName[dbName.toLowerCase()];
        }
        if (!matchedTeam) {
            matchedTeam = teamMapByName[spaName.toLowerCase()];
        }
        
        if (!matchedTeam) {
            results.push({ name: spaName, code, found: false, count: 0, coachFound: false });
            continue;
        }
        
        // Fetch players count
        const { count: playerCount } = await supabase
            .from('players')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', matchedTeam.id);
            
        // Fetch coach count
        const { count: coachCount } = await supabase
            .from('coaches')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', matchedTeam.id);
            
        results.push({
            name: spaName,
            dbName: matchedTeam.name,
            dbId: matchedTeam.id,
            code,
            found: true,
            playerCount: playerCount || 0,
            coachCount: coachCount || 0
        });
    }
    
    console.log('\n--- SQUAD SANITY CHECK ---');
    results.forEach(r => {
        if (!r.found) {
            console.log(`❌ Team "${r.name}" (${r.code}) NOT FOUND in DB.`);
        } else {
            const status = r.playerCount > 0 ? '✅' : '⚠️ NO PLAYERS';
            const coachStatus = r.coachCount > 0 ? '👨‍💼' : '❌ NO COACH';
            console.log(`${status} ${r.name} (${r.dbName}, ID: ${r.dbId}): ${r.playerCount} players. Coach: ${coachStatus}`);
        }
    });
    
    process.exit(0);
}

main();
