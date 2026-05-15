import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testScrape() {
    const url = 'https://es.wikipedia.org/wiki/Clasificaci%C3%B3n_de_Conmebol_para_la_Copa_Mundial_de_F%C3%BAtbol_de_2026';
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    $('table').each((i, table) => {
        // Look for typical football standing indicators
        const htmlContent = $(table).html();
        if (htmlContent.includes('Pts') && htmlContent.includes('PJ') && htmlContent.includes('GF')) {
            console.log("Found a potential standings table!");
            const teams = [];
            $(table).find('tr').each((j, tr) => {
                const tds = $(tr).find('td, th');
                if (tds.length >= 8) {
                    const rowTexts = tds.map((k, td) => $(td).text().trim()).get();
                    if (rowTexts[1] && rowTexts[1].length > 2) {
                        teams.push(rowTexts);
                    }
                }
            });
            console.log(teams.slice(0, 3));
        }
    });
}

testScrape();
