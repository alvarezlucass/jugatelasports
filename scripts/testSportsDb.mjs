const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3';

async function search() {
    try {
        console.log("Downloading all leagues...");
        const res = await fetch(`${BASE_URL}/all_leagues.php`);
        const leaguesData = await res.json();
        
        const worldCups = leaguesData.leagues.filter(l => l.strLeague.toLowerCase().includes('world cup') && l.strSport === 'Soccer');
        
        const fifaWc = worldCups.find(wc => wc.strLeague === 'FIFA World Cup');
        if (fifaWc) {
            console.log(`\nFound FIFA World Cup: ID ${fifaWc.idLeague}`);
            
            const tableRes = await fetch(`${BASE_URL}/lookuptable.php?l=${fifaWc.idLeague}&s=2026`);
            const tableData = await tableRes.json();
            
            if (tableData.table) {
                console.log(`Success! Found ${tableData.table.length} teams in 2026.`);
            } else {
                console.log("No 2026 standings found yet.");
                
                // Let's get the teams for the world cup league instead
                console.log("\nAttempting to fetch teams in this league...");
                const teamsRes = await fetch(`${BASE_URL}/search_all_teams.php?l=FIFA%20World%20Cup`);
                const teamsData = await teamsRes.json();
                if (teamsData.teams) {
                    console.log(`Found ${teamsData.teams.length} teams registered for FIFA World Cup.`);
                }
            }
            
            // Qualifiers checking: (CONMEBOL ID is usually another league)
            const conmebolQual = worldCups.find(wc => wc.strLeague.includes('CONMEBOL'));
            if (conmebolQual) {
                console.log(`Found Qualifiers: ${conmebolQual.strLeague}`);
            }
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

search();
