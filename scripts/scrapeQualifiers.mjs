import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../src/data/qualifiers.json');

const REGIONS = [
    { name: 'CONMEBOL', url: 'https://es.wikipedia.org/wiki/Clasificaci%C3%B3n_de_Conmebol_para_la_Copa_Mundial_de_F%C3%BAtbol_de_2026' },
    { name: 'CONCACAF', url: 'https://es.wikipedia.org/wiki/Clasificaci%C3%B3n_de_Concacaf_para_la_Copa_Mundial_de_F%C3%BAtbol_de_2026' },
    { name: 'UEFA', url: 'https://es.wikipedia.org/wiki/Clasificaci%C3%B3n_de_UEFA_para_la_Copa_Mundial_de_F%C3%BAtbol_de_2026' },
    { name: 'CAF', url: 'https://es.wikipedia.org/wiki/Clasificaci%C3%B3n_de_CAF_para_la_Copa_Mundial_de_F%C3%BAtbol_de_2026' },
    { name: 'AFC', url: 'https://es.wikipedia.org/wiki/Clasificaci%C3%B3n_de_AFC_para_la_Copa_Mundial_de_F%C3%BAtbol_de_2026' },
    { name: 'OFC', url: 'https://es.wikipedia.org/wiki/Clasificaci%C3%B3n_de_OFC_para_la_Copa_Mundial_de_F%C3%BAtbol_de_2026' },
];

async function scrapeQualifiers() {
    const allData = [];

    for (const region of REGIONS) {
        console.log(`Scraping ${region.name}...`);
        try {
            const res = await fetch(region.url);
            const html = await res.text();
            const $ = cheerio.load(html);
            const groups = [];

            $('table').each((i, table) => {
                const htmlContent = $(table).html();
                // Identificar si la tabla es de posiciones
                // En español suele decir "Pts" o "Pts." y "PJ"
                if (htmlContent.includes('Pts') && htmlContent.includes('PJ') && htmlContent.includes('GF')) {
                    
                    const teams = [];
                    let headerMap = {};
                    
                    $(table).find('tr').each((j, tr) => {
                        const tds = $(tr).find('td, th');
                        const rowTexts = tds.map((k, td) => $(td).text().trim().replace(/\[.*?\]/g, '')).get();
                        
                        // Si es la cabecera (contiene Pts)
                        if (rowTexts.some(text => text.includes('Pts') || text.includes('Puntos'))) {
                            rowTexts.forEach((text, index) => {
                                const lower = text.toLowerCase();
                                if (lower.includes('pos')) headerMap.pos = index;
                                else if (lower.includes('selec') || lower.includes('equipo') || lower.includes('país')) headerMap.team = index;
                                else if (lower === 'pts' || lower === 'pts.' || lower === 'puntos') headerMap.pts = index;
                                else if (lower === 'pj') headerMap.pj = index;
                                else if (lower === 'pg' || lower === 'g') headerMap.won = index;
                                else if (lower === 'pe' || lower === 'e') headerMap.drawn = index;
                                else if (lower === 'pp' || lower === 'p') headerMap.lost = index;
                                else if (lower === 'gf') headerMap.gf = index;
                                else if (lower === 'gc') headerMap.gc = index;
                            });
                        }
                        // Si es una fila de equipo (tiene números en Pts o PJ y el nombre es suficientemente largo)
                        else if (Object.keys(headerMap).length > 0 && tds.length >= 7) {
                            // Extract values based on headerMap
                            const posText = rowTexts[headerMap.pos || 0] || '';
                            const posMatch = posText.match(/\d+/);
                            const rank = posMatch ? parseInt(posMatch[0]) : teams.length + 1;
                            
                            let teamName = rowTexts[headerMap.team || 1] || '';
                            // Remove 3-letter codes like "ARG Argentina" -> "Argentina"
                            teamName = teamName.replace(/^[A-Z]{3}\s+/, '').trim();
                            // If still weird, get standard text
                            if (!teamName || teamName.length < 3) {
                                // sometimes images push text down, try grabbing directly from the DOM
                                teamName = $(tds[headerMap.team || 1]).find('a').last().text().trim() || $(tds[headerMap.team || 1]).text().trim();
                                teamName = teamName.replace(/^[A-Z]{3}\s+/, '').replace(/\[.*?\]/g, '').trim();
                            }
                            
                            const pj = parseInt(rowTexts[headerMap.pj || 3]) || 0;
                            const pts = parseInt(rowTexts[headerMap.pts || 2]) || 0;
                            const won = parseInt(rowTexts[headerMap.won || 4]) || 0;
                            const drawn = parseInt(rowTexts[headerMap.drawn || 5]) || 0;
                            const lost = parseInt(rowTexts[headerMap.lost || 6]) || 0;
                            const gf = parseInt(rowTexts[headerMap.gf || 7]) || 0;
                            const gc = parseInt(rowTexts[headerMap.gc || 8]) || 0;

                            if (teamName && teamName.length > 2 && teamName.toLowerCase() !== 'equipo') {
                                teams.push({
                                    rank,
                                    name: teamName,
                                    pj, won, drawn, lost, goalsFor: gf, goalsAgainst: gc, points: pts
                                });
                            }
                        }
                    });

                    if (teams.length > 0) {
                        let groupName = `Grupo ${groups.length + 1}`;
                        const prevHeading = $(table).prevAll('h3, h2').first().text().replace(/\[.*?\]/g, '').trim();
                        if (prevHeading) {
                            groupName = prevHeading;
                        }
                        if (region.name === 'CONMEBOL') {
                            groupName = 'Clasificación General';
                        }
                        // To avoid duplicate tables (sometimes Wikipedia has 'home' and 'away' subtables)
                        if (!groups.find(g => g.name === groupName)) {
                            groups.push({ name: groupName, teams });
                        } else {
                             // Si el grupo ya existe, le ponemos nombre generico diferente
                             groups.push({ name: `${groupName} (Tabla ${groups.length + 1})`, teams });
                        }
                    }
                }
            });

            allData.push({ region: region.name, groups });
        } catch (error) {
            console.error(`Error scraping ${region.name}:`, error);
        }
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(allData, null, 2));
    console.log(`Saved ${allData.length} valid regions to ${DATA_FILE}`);
}

scrapeQualifiers();
