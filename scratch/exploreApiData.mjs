import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_KEY = process.env.VITE_API_FOOTBALL_KEY;
const API_URL = process.env.VITE_API_FOOTBALL_URL || 'https://v3.football.api-sports.io';

const headers = {
    'x-rapidapi-host': 'v3.football.api-sports.io',
    'x-rapidapi-key': API_KEY
};

const outputDir = path.resolve(__dirname, 'api_responses');

// Asegurar que la carpeta de respuestas exista
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function fetchAndSave(endpoint, filename, description) {
    const url = `${API_URL}/${endpoint}`;
    console.log(`\nFetching: ${description}...`);
    console.log(`URL: ${url}`);
    
    try {
        const res = await fetch(url, { headers });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const json = await res.json();
        
        if (json.errors && Object.keys(json.errors).length > 0) {
            console.error(`⚠️ API returned errors:`, json.errors);
        }
        
        const filePath = path.join(outputDir, filename);
        fs.writeFileSync(filePath, JSON.stringify(json, null, 4), 'utf-8');
        console.log(`✅ Guardado en: scratch/api_responses/${filename}`);
        return json;
    } catch (error) {
        console.error(`❌ Error fetching ${description}:`, error.message);
        return null;
    }
}

async function main() {
    if (!API_KEY) {
        console.error('❌ No se encontró VITE_API_FOOTBALL_KEY en el archivo .env');
        process.exit(1);
    }
    
    console.log('🚀 Iniciando exploración de la API-Football...');
    console.log(`📂 Las respuestas detalladas se guardarán en: ${outputDir}\n`);

    // 1. Buscar Ligas de Argentina para obtener IDs válidos
    await fetchAndSave(
        'leagues?country=Argentina&season=2024',
        'leagues_argentina_2024.json',
        'Ligas de Argentina de la temporada 2024 (LFP, etc.)'
    );

    // 2. Información del equipo de Argentina (ID: 26 es la Selección de Argentina)
    await fetchAndSave(
        'teams?id=26',
        'datos_equipo_argentina.json',
        'Información detallada de la Selección Argentina (Estadios, logos, etc.)'
    );

    // 3. Squad (Plantilla) de la Selección de Argentina
    await fetchAndSave(
        'players/squads?team=26',
        'plantilla_argentina.json',
        'Plantilla de jugadores convocados de la Selección Argentina'
    );

    // 4. Obtener un partido de ejemplo detallado. 
    // Usaremos el ID de un partido histórico o reciente si lo conocemos.
    // Ej: 863212 es la final del mundial 2022 (Argentina vs Francia). ¡Excelente para ver toda la data!
    const fixtureId = 863212; 
    await fetchAndSave(
        `fixtures?id=${fixtureId}`,
        'partido_detalle_final_mundial.json',
        'Detalle del partido Argentina vs Francia (Final Mundial 2022: Goles, Eventos, Alineaciones, Estadísticas)'
    );

    // 5. Predicciones para ese mismo partido (compara estadísticas cara a cara, probabilidades, etc.)
    await fetchAndSave(
        `predictions?fixture=${fixtureId}`,
        'predicciones_final_mundial.json',
        'Predicciones y comparaciones del partido Argentina vs Francia'
    );

    console.log('\n✨ ¡Exploración completada!');
    console.log('Ahora puedes abrir la carpeta `scratch/api_responses/` en tu editor para ver exactamente qué te provee la API en formato JSON real.');
    process.exit(0);
}

main();
