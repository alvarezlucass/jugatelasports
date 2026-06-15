import fs from 'fs';

const filePath = 'src/data/worldCupPersistence.ts';
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  { oldId: 'm4', newId: '1539004', home: 'Sudáfrica', away: 'República Checa', realHome: 'Sudáfrica', realAway: 'República Checa' },
  { oldId: 'm10', newId: '1539005', home: 'Bosnia', away: 'Suiza', realHome: 'Suiza', realAway: 'Bosnia' },
  { oldId: 'm16', newId: '1489390', home: 'Marruecos', away: 'Escocia', realHome: 'Escocia', realAway: 'Marruecos' },
  { oldId: 'm22', newId: '1539006', home: 'Paraguay', away: 'Turquía', realHome: 'Turquía', realAway: 'Paraguay' },
  { oldId: 'm28', newId: '1489392', home: 'Curazao', away: 'Ecuador', realHome: 'Ecuador', realAway: 'Curazao' },
  { oldId: 'm34', newId: '1489394', home: 'Japón', away: 'Túnez', realHome: 'Túnez', realAway: 'Japón' },
  { oldId: 'm40', newId: '1489396', home: 'Egipto', away: 'Nueva Zelanda', realHome: 'Nueva Zelanda', realAway: 'Egipto' },
  { oldId: 'm46', newId: '1489398', home: 'Cabo Verde', away: 'Uruguay', realHome: 'Uruguay', realAway: 'Cabo Verde' },
  { oldId: 'm52', newId: '1489401', home: 'Senegal', away: 'Noruega', realHome: 'Noruega', realAway: 'Senegal' },
  { oldId: 'm58', newId: '1489400', home: 'Argelia', away: 'Jordania', realHome: 'Jordania', realAway: 'Argelia' },
  { oldId: 'm64', newId: '1539008', home: 'RD Congo', away: 'Colombia', realHome: 'Colombia', realAway: 'RD Congo' },
  { oldId: 'm70', newId: '1489403', home: 'Croacia', away: 'Panamá', realHome: 'Panamá', realAway: 'Croacia' }
];

for (const r of replacements) {
    // Note: my previous script might have already replaced m4 with 1539004, but didn't swap home/away.
    // Or it might still say 'm10', 'm16', etc.
    
    // First, let's find the line matching either the oldId or newId and the original home/away teams.
    const regex = new RegExp(`{\\s*id:\\s*['"](?:${r.oldId}|${r.newId})['"],\\s*group:\\s*['"][A-L]['"],\\s*homeTeam:\\s*['"]${r.home}['"],\\s*awayTeam:\\s*['"]${r.away}['"][^}]*}`);
    
    const match = content.match(regex);
    if (match) {
        // We found the line. Let's rebuild it with the correct ID and the correct home/away.
        // E.g., replace id, homeTeam, awayTeam
        let newSnippet = match[0]
            .replace(/id:\s*['"](?:m\d+|\d+)['"]/, `id: '${r.newId}'`)
            .replace(/homeTeam:\s*['"][^'"]+['"]/, `homeTeam: '${r.realHome}'`)
            .replace(/awayTeam:\s*['"][^'"]+['"]/, `awayTeam: '${r.realAway}'`);
        
        content = content.replace(match[0], newSnippet);
        console.log(`Fixed: ${r.realHome} vs ${r.realAway} (${r.newId})`);
    } else {
        console.log(`Could not find line for ${r.home} vs ${r.away}`);
    }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('worldCupPersistence.ts updated successfully.');
