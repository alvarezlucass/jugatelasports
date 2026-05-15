async function fetchOpenFootball() {
    try {
        console.log("Fetching World Cup 2026 data from openfootball...");
        const res = await fetch('https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json');
        
        const data = await res.json();
        console.log(`World Cup 2026 Loaded! Name: ${data.name}`);
        
        if(data.rounds) {
            console.log(`\nFound ${data.rounds.length} rounds.`);
            console.log("First round:", data.rounds[0].name);
            if (data.rounds[0].matches) {
                console.log("Matches:", data.rounds[0].matches.length);
                console.log("Sample:", data.rounds[0].matches[0]);
            }
        }
        
        console.log("\nGroups?");
        if (data.groups) {
           data.groups.forEach(g => console.log(g.name));
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

fetchOpenFootball();
