import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const apiFootballKey = process.env.VITE_API_FOOTBALL_KEY!;
const apiFootballUrl = process.env.VITE_API_FOOTBALL_URL || 'https://v3.football.api-sports.io';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fetchFootball(endpoint: string, params: Record<string, string>) {
    const url = new URL(`${apiFootballUrl}/${endpoint}`);
    Object.entries(params).forEach(([key, val]) => url.searchParams.append(key, val));
    const res = await fetch(url.toString(), {
        headers: { 'x-apisports-key': apiFootballKey }
    });
    const json = await res.json();
    return json;
}

// Datos de trofeos históricos de los clubes argentinos (curada manualmente basada en hechos reales)
const ARGENTINA_TROPHIES: Record<string, { league: string; season: string; place: string; country: string }[]> = {
    'River Plate': [
        { league: 'Primera División', season: '2021', place: 'Winner', country: 'Argentina' },
        { league: 'Primera División', season: '2019/2020', place: 'Winner', country: 'Argentina' },
        { league: 'Copa Libertadores', season: '2018', place: 'Winner', country: 'South America' },
        { league: 'Copa Libertadores', season: '2015', place: 'Winner', country: 'South America' },
        { league: 'Copa Libertadores', season: '1996', place: 'Winner', country: 'South America' },
        { league: 'Copa Libertadores', season: '1986', place: 'Winner', country: 'South America' },
        { league: 'Copa Intercontinental', season: '1986', place: 'Winner', country: 'World' },
    ],
    'Boca Juniors': [
        { league: 'Primera División', season: '2022', place: 'Winner', country: 'Argentina' },
        { league: 'Primera División', season: '2020', place: 'Winner', country: 'Argentina' },
        { league: 'Copa Libertadores', season: '2007', place: 'Winner', country: 'South America' },
        { league: 'Copa Libertadores', season: '2003', place: 'Winner', country: 'South America' },
        { league: 'Copa Libertadores', season: '2001', place: 'Winner', country: 'South America' },
        { league: 'Copa Libertadores', season: '2000', place: 'Winner', country: 'South America' },
        { league: 'Copa Libertadores', season: '1978', place: 'Winner', country: 'South America' },
        { league: 'Copa Libertadores', season: '1977', place: 'Winner', country: 'South America' },
        { league: 'Copa Intercontinental', season: '2000', place: 'Winner', country: 'World' },
        { league: 'Copa Intercontinental', season: '2003', place: 'Winner', country: 'World' },
    ],
    'Racing Club': [
        { league: 'Primera División', season: '2019', place: 'Winner', country: 'Argentina' },
        { league: 'Copa Libertadores', season: '1967', place: 'Winner', country: 'South America' },
        { league: 'Copa Intercontinental', season: '1967', place: 'Winner', country: 'World' },
    ],
    'San Lorenzo': [
        { league: 'Primera División', season: '2013/2014', place: 'Winner', country: 'Argentina' },
        { league: 'Copa Libertadores', season: '2014', place: 'Winner', country: 'South America' },
    ],
    'Independiente': [
        { league: 'Copa Libertadores', season: '1984', place: 'Winner', country: 'South America' },
        { league: 'Copa Libertadores', season: '1975', place: 'Winner', country: 'South America' },
        { league: 'Copa Libertadores', season: '1974', place: 'Winner', country: 'South America' },
        { league: 'Copa Libertadores', season: '1973', place: 'Winner', country: 'South America' },
        { league: 'Copa Libertadores', season: '1972', place: 'Winner', country: 'South America' },
        { league: 'Copa Libertadores', season: '1965', place: 'Winner', country: 'South America' },
        { league: 'Copa Libertadores', season: '1964', place: 'Winner', country: 'South America' },
    ],
    'Estudiantes L.P.': [
        { league: 'Copa Libertadores', season: '2009', place: 'Winner', country: 'South America' },
        { league: 'Copa Libertadores', season: '1970', place: 'Winner', country: 'South America' },
        { league: 'Copa Libertadores', season: '1969', place: 'Winner', country: 'South America' },
        { league: 'Copa Libertadores', season: '1968', place: 'Winner', country: 'South America' },
    ],
    'Velez Sarsfield': [
        { league: 'Copa Libertadores', season: '1994', place: 'Winner', country: 'South America' },
        { league: 'Copa Intercontinental', season: '1994', place: 'Winner', country: 'World' },
    ],
    'Argentinos JRS': [
        { league: 'Copa Libertadores', season: '1985', place: 'Winner', country: 'South America' },
    ],
    'Lanus': [
        { league: 'Copa Sudamericana', season: '2013', place: 'Winner', country: 'South America' },
    ],
    'Defensa Y Justicia': [
        { league: 'Copa Sudamericana', season: '2020', place: 'Winner', country: 'South America' },
        { league: 'Recopa Sudamericana', season: '2021', place: 'Winner', country: 'South America' },
    ],
};

async function syncTrophiesFromLocal() {
    console.log('--- CARGANDO TROFEOS HISTÓRICOS (Curados) ---\n');

    const { data: teams } = await supabase.from('teams').select('id, name');
    if (!teams) { console.error('No hay equipos'); return; }

    let totalInserted = 0;

    for (const team of teams) {
        const teamTrophies = ARGENTINA_TROPHIES[team.name];
        if (!teamTrophies || teamTrophies.length === 0) {
            console.log(`${team.name}: Sin trofeos relevantes registrados.`);
            continue;
        }

        const rows = teamTrophies.map(t => ({
            team_id: team.id,
            league: t.league,
            country: t.country,
            season: t.season,
            place: t.place
        }));

        await supabase.from('trophies').delete().eq('team_id', team.id);
        const { error } = await supabase.from('trophies').insert(rows);

        if (error) {
            console.error(`Error en ${team.name}:`, error.message);
        } else {
            console.log(`✓ ${team.name}: ${rows.length} trofeos cargados.`);
            totalInserted += rows.length;
        }
    }

    console.log(`\n--- COMPLETADO: ${totalInserted} trofeos históricos en la DB ---`);
}

syncTrophiesFromLocal().catch(console.error);
