/**
 * auditAndRepair.mjs
 * ==================
 * Script de auditoría y reparación completa de datos en Supabase.
 *
 * Funciones:
 *   1. Auditar ligas: verificar que existan en DB con api_id correcto
 *   2. Auditar equipos: logo, nombre, metadata (estadio, ciudad)
 *   3. Auditar partidos: que tengan league_id como dbId correcto,
 *      home_team_logo, away_team_logo y los campos básicos
 *   4. Reparar partidos FINISHED sin events/stats/lineups (en batches controlados)
 *   5. Reporte final con resumen de hallazgos
 *
 * Uso:
 *   node scripts/auditAndRepair.mjs              -> Solo auditoría + corrección de partidos sin detalles
 *   node scripts/auditAndRepair.mjs --fix-all    -> Auditoría + reparación completa (re-sync equipos también)
 *   node scripts/auditAndRepair.mjs --league=lpf -> Solo una liga específica
 *   node scripts/auditAndRepair.mjs --details-only -> Solo reparar partidos sin detalles (events/stats/lineups)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const API_KEY = process.env.VITE_API_FOOTBALL_KEY;
const API_URL = process.env.VITE_API_FOOTBALL_URL || 'https://v3.football.api-sports.io';

if (!SUPABASE_URL || !SUPABASE_KEY || !API_KEY) {
    console.error('❌ Missing required environment variables. Check your .env file.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ADMIN_EMAIL = 'admin@jugatelasports.com';
const ADMIN_PASSWORD = '@Marte2026';

// Mapa completo de ligas: API ID -> configuración de DB
const LEAGUES_CONFIG = [
    { apiId: 1,   dbId: 'world-cup-2026',    season: 2026, name: 'World Cup 2026',                   country: 'World' },
    { apiId: 128, dbId: 'lpf',               season: 2026, name: 'Liga Profesional Argentina',        country: 'Argentina' },
    { apiId: 129, dbId: 'primera-nacional',  season: 2026, name: 'Primera Nacional',                  country: 'Argentina' },
    { apiId: 130, dbId: 'copa-argentina',    season: 2026, name: 'Copa Argentina',                    country: 'Argentina' },
    { apiId: 2,   dbId: 'ucl',               season: 2025, name: 'UEFA Champions League',             country: 'Europe' },
    { apiId: 39,  dbId: 'premier',           season: 2025, name: 'Premier League',                    country: 'England' },
    { apiId: 13,  dbId: 'libertadores',      season: 2026, name: 'Copa Libertadores',                 country: 'South America' },
    { apiId: 140, dbId: 'laliga',            season: 2025, name: 'La Liga',                           country: 'Spain' },
    { apiId: 135, dbId: 'serie-a',           season: 2025, name: 'Serie A (Italia)',                  country: 'Italy' },
    { apiId: 78,  dbId: 'bundesliga',        season: 2025, name: 'Bundesliga (Alemania)',              country: 'Germany' },
    { apiId: 61,  dbId: 'ligue1',            season: 2025, name: 'Ligue 1 (Francia)',                 country: 'France' },
    { apiId: 3,   dbId: 'uel',               season: 2025, name: 'UEFA Europa League',                country: 'Europe' },
    { apiId: 94,  dbId: 'primeira-liga',     season: 2025, name: 'Primeira Liga (Portugal)',          country: 'Portugal' },
    { apiId: 71,  dbId: 'brasileirao',       season: 2026, name: 'Campeonato Brasileiro Série A',     country: 'Brazil' },
    { apiId: 262, dbId: 'ligamx',            season: 2025, name: 'Liga MX (México)',                  country: 'Mexico' },
    { apiId: 239, dbId: 'primera-a-colombia',season: 2026, name: 'Categoría Primera A (Colombia)',    country: 'Colombia' },
    { apiId: 265, dbId: 'primera-chile',     season: 2026, name: 'Primera División (Chile)',          country: 'Chile' },
    { apiId: 268, dbId: 'primera-uruguay',   season: 2026, name: 'Primera División (Uruguay)',        country: 'Uruguay' },
    { apiId: 11,  dbId: 'sudamericana',      season: 2026, name: 'Copa Sudamericana',                 country: 'South America' },
];

// Build lookup maps
const API_ID_TO_LEAGUE = new Map(LEAGUES_CONFIG.map(l => [l.apiId, l]));
const DB_ID_TO_LEAGUE = new Map(LEAGUES_CONFIG.map(l => [l.dbId, l]));

// Parse CLI args
const args = process.argv.slice(2);
const FIX_ALL = args.includes('--fix-all');
const DETAILS_ONLY = args.includes('--details-only');
const leagueArg = args.find(a => a.startsWith('--league='));
const LEAGUE_FILTER = leagueArg ? leagueArg.split('=')[1] : null;
// Max fixtures to repair per run (to avoid hitting API rate limits)
const maxFixArg = args.find(a => a.startsWith('--max-fix='));
const MAX_FIX_PER_LEAGUE = maxFixArg ? parseInt(maxFixArg.split('=')[1]) : 10;

// ─── Utility: API rate-limit-safe fetch ────────────────────────────────────
let lastApiCall = 0;
let API_LIMIT_REACHED = false;

async function fetchFromApi(endpoint, params = {}) {
    if (API_LIMIT_REACHED) return null;

    // Ensure at least 350ms between calls
    const now = Date.now();
    const elapsed = now - lastApiCall;
    if (elapsed < 350) await new Promise(r => setTimeout(r, 350 - elapsed));
    lastApiCall = Date.now();

    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_URL}/${endpoint}?${queryParams}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': API_KEY
            }
        });
        const json = await response.json();

        if (json.errors && Object.keys(json.errors).length > 0) {
            const errStr = JSON.stringify(json.errors);
            // Detect daily rate limit
            if (errStr.toLowerCase().includes('request limit') || errStr.toLowerCase().includes('reached the request')) {
                API_LIMIT_REACHED = true;
                console.error(`\n   🚫 LÍMITE DIARIO DE API ALCANZADO. Deteniendo reparación.`);
                console.error(`   → Reintentar mañana: node scripts/auditAndRepair.mjs --details-only --max-fix=50\n`);
                return null;
            }
            console.error(`   ⚠️  API Error for ${endpoint}:`, errStr);
            return null;
        }
        return json.response || [];
    } catch (error) {
        console.error(`   ❌ Request to ${endpoint} failed:`, error.message);
        return null;
    }
}

// ─── Auth ──────────────────────────────────────────────────────────────────
async function authenticateAsAdmin() {
    const { error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });
    if (error) {
        console.error('❌ Failed to authenticate as admin:', error.message);
        process.exit(1);
    }
    console.log('✅ Authenticated as Admin.\n');
}

// ─── Helper: map positions ─────────────────────────────────────────────────
function mapPos(pos) {
    switch (pos) {
        case 'G': return 'GK';
        case 'D': return 'DEF';
        case 'M': return 'MID';
        case 'F': return 'FWD';
        default:  return pos || 'MID';
    }
}

function mapStatus(s) {
    switch (s) {
        case 'TBD': case 'NS': return 'UPCOMING';
        case 'LIVE': case '1H': case '2H': case 'HT': return 'LIVE';
        case 'FT': case 'AET': case 'PEN': return 'FINISHED';
        case 'CANC': case 'PST': return 'CANCELLED';
        default: return 'UPCOMING';
    }
}

// ─── STEP 1: Audit & repair leagues table ──────────────────────────────────
async function auditLeagues(report) {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  PASO 1: Auditando tabla LEAGUES');
    console.log('═══════════════════════════════════════════════════════');

    const { data: dbLeagues, error } = await supabase.from('leagues').select('*');
    if (error) {
        console.error('❌ Error fetching leagues from DB:', error.message);
        return;
    }

    const dbLeagueMap = new Map(dbLeagues.map(l => [l.id, l]));

    const leaguesToCheck = LEAGUE_FILTER
        ? LEAGUES_CONFIG.filter(l => l.dbId === LEAGUE_FILTER)
        : LEAGUES_CONFIG;

    let fixed = 0;
    let issues = 0;

    for (const cfg of leaguesToCheck) {
        const existing = dbLeagueMap.get(cfg.dbId);

        if (!existing) {
            console.log(`  ⚠️  Liga FALTANTE en DB: ${cfg.dbId} (${cfg.name})`);
            issues++;
            // Fix: insert league
            const { error: insertErr } = await supabase.from('leagues').upsert({
                id: cfg.dbId,
                api_id: cfg.apiId,
                name: cfg.name,
                country: cfg.country,
                is_active: true,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
            if (insertErr) {
                console.error(`     ❌ No se pudo insertar liga ${cfg.dbId}:`, insertErr.message);
            } else {
                console.log(`     ✅ Liga ${cfg.dbId} insertada correctamente.`);
                fixed++;
            }
        } else {
            // Check api_id
            if (!existing.api_id || existing.api_id !== cfg.apiId) {
                console.log(`  ⚠️  Liga ${cfg.dbId} tiene api_id incorrecto (${existing.api_id} vs ${cfg.apiId})`);
                issues++;
                const { error: updErr } = await supabase.from('leagues')
                    .update({ api_id: cfg.apiId, country: cfg.country, updated_at: new Date().toISOString() })
                    .eq('id', cfg.dbId);
                if (!updErr) { console.log(`     ✅ api_id corregido.`); fixed++; }
            } else {
                console.log(`  ✅ Liga OK: ${cfg.dbId} (api_id: ${cfg.apiId})`);
            }
        }
    }

    report.leagues = { issues, fixed };
    console.log(`\n  → Liga issues encontrados: ${issues}, corregidos: ${fixed}`);
}

// ─── STEP 2: Audit teams (logos, names) ───────────────────────────────────
async function auditTeams(report) {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  PASO 2: Auditando tabla TEAMS');
    console.log('═══════════════════════════════════════════════════════');

    const { data: teams, error } = await supabase.from('teams').select('id, name, logo, short_name, stadium_name');
    if (error) {
        console.error('❌ Error fetching teams:', error.message);
        return;
    }

    const noLogo = teams.filter(t => !t.logo);
    const noShortName = teams.filter(t => !t.short_name);

    console.log(`  Total equipos en DB: ${teams.length}`);
    console.log(`  Sin logo: ${noLogo.length}`);
    console.log(`  Sin short_name: ${noShortName.length}`);

    report.teams = {
        total: teams.length,
        noLogo: noLogo.length,
        noShortName: noShortName.length,
        noLogoList: noLogo.map(t => `${t.name} (ID: ${t.id})`).slice(0, 20)
    };

    if (noLogo.length > 0) {
        console.log('\n  Equipos sin logo:');
        noLogo.slice(0, 20).forEach(t => console.log(`    - ${t.name} (ID: ${t.id})`));
        if (noLogo.length > 20) console.log(`    ... y ${noLogo.length - 20} más`);
    }

    if (FIX_ALL && noLogo.length > 0) {
        console.log('\n  🔧 Reparando equipos sin logo desde la API...');
        let fixed = 0;
        for (const team of noLogo.slice(0, 30)) { // Limit to avoid rate limits
            const res = await fetchFromApi('teams', { id: team.id });
            if (res && res.length > 0) {
                const t = res[0];
                const { error: updErr } = await supabase.from('teams').update({
                    logo: t.team.logo,
                    short_name: t.team.code || team.short_name,
                    stadium_name: t.venue?.name || team.stadium_name,
                    updated_at: new Date().toISOString()
                }).eq('id', team.id);
                if (!updErr) {
                    console.log(`     ✅ ${team.name}: logo actualizado`);
                    fixed++;
                }
            }
        }
        report.teams.fixed = fixed;
    }
}

// ─── STEP 3: Audit matches - check league_id mapping & logos ───────────────
async function auditMatches(report) {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  PASO 3: Auditando tabla MATCHES (league_id, logos)');
    console.log('═══════════════════════════════════════════════════════');

    // Fetch all matches in pages
    let allMatches = [];
    let page = 0;
    const PAGE_SIZE = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('matches')
            .select('id, league_id, home_team, away_team, home_team_logo, away_team_logo, status, start_time, metadata')
            .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
            .order('start_time', { ascending: false });

        if (error) { console.error('❌ Error fetching matches:', error.message); break; }
        if (!data || data.length === 0) break;
        allMatches = allMatches.concat(data);
        if (data.length < PAGE_SIZE) break;
        page++;
    }

    console.log(`  Total partidos en DB: ${allMatches.length}`);

    // Analyze
    const wrongLeagueId = [];
    const noHomeLogo = [];
    const noAwayLogo = [];
    const finishedMissingDetails = [];
    const statusCounts = {};

    for (const m of allMatches) {
        // Count by status
        statusCounts[m.status] = (statusCounts[m.status] || 0) + 1;

        // Check if league_id is a number string (API ID) instead of dbId
        const numericId = parseInt(m.league_id);
        if (!isNaN(numericId) && API_ID_TO_LEAGUE.has(numericId)) {
            const correctLeague = API_ID_TO_LEAGUE.get(numericId);
            wrongLeagueId.push({ id: m.id, current: m.league_id, correct: correctLeague.dbId });
        }

        if (!m.home_team_logo) noHomeLogo.push(m);
        if (!m.away_team_logo) noAwayLogo.push(m);

        // Check finished matches without details
        if (m.status === 'FINISHED') {
            const meta = m.metadata || {};
            const missingEvents = !meta.events || meta.events.length === 0;
            const missingStats  = !meta.stats;
            const missingLineup = !meta.lineup_home;
            if (missingEvents || missingStats || missingLineup) {
                finishedMissingDetails.push({
                    id: m.id,
                    start_time: m.start_time,
                    missingEvents,
                    missingStats,
                    missingLineup
                });
            }
        }
    }

    console.log('\n  📊 Distribución de estados:');
    for (const [status, count] of Object.entries(statusCounts)) {
        console.log(`    ${status}: ${count}`);
    }
    console.log(`\n  ⚠️  Partidos con league_id incorrecto (numérico): ${wrongLeagueId.length}`);
    console.log(`  ⚠️  Partidos sin logo local: ${noHomeLogo.length}`);
    console.log(`  ⚠️  Partidos sin logo visitante: ${noAwayLogo.length}`);
    console.log(`  ⚠️  Partidos FINISHED sin detalles (events/stats/lineups): ${finishedMissingDetails.length}`);

    report.matches = {
        total: allMatches.length,
        statusCounts,
        wrongLeagueId: wrongLeagueId.length,
        noHomeLogo: noHomeLogo.length,
        noAwayLogo: noAwayLogo.length,
        finishedMissingDetails: finishedMissingDetails.length,
        finishedMissingDetailsList: finishedMissingDetails
    };

    // Fix: update league_id from numeric API IDs to dbIds
    if (wrongLeagueId.length > 0) {
        console.log('\n  🔧 Corrigiendo league_id de numeric a dbId...');
        let fixed = 0;
        // Group by correct league to batch update
        const byLeague = new Map();
        for (const item of wrongLeagueId) {
            if (!byLeague.has(item.correct)) byLeague.set(item.correct, []);
            byLeague.get(item.correct).push(item.id);
        }
        for (const [correctDbId, ids] of byLeague.entries()) {
            // Update in batches of 200
            for (let i = 0; i < ids.length; i += 200) {
                const batch = ids.slice(i, i + 200);
                const { error: updErr } = await supabase
                    .from('matches')
                    .update({ league_id: correctDbId })
                    .in('id', batch);
                if (updErr) {
                    console.error(`  ❌ Error updating league_id to ${correctDbId}:`, updErr.message);
                } else {
                    fixed += batch.length;
                }
            }
            console.log(`  ✅ ${ids.length} partidos actualizados a league_id = '${correctDbId}'`);
        }
        report.matches.leagueIdFixed = fixed;
    }

    return finishedMissingDetails;
}

// ─── STEP 4: Repair finished matches without details ──────────────────────
async function repairMatchDetails(finishedMissingDetails, report) {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  PASO 4: Reparando partidos FINISHED sin detalles');
    console.log('═══════════════════════════════════════════════════════');

    if (finishedMissingDetails.length === 0) {
        console.log('  ✅ No hay partidos FINISHED que necesiten reparación.');
        report.repairs = { attempted: 0, success: 0, failed: 0 };
        return;
    }

    // Sort by most recent first, then take the limit
    const sorted = finishedMissingDetails
        .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

    // If we have a league filter, we already filtered in auditMatches; otherwise apply global limit
    const toFix = sorted.slice(0, MAX_FIX_PER_LEAGUE * (LEAGUE_FILTER ? 1 : LEAGUES_CONFIG.length));

    console.log(`  Intentando reparar ${toFix.length} de ${finishedMissingDetails.length} partidos (--max-fix=${MAX_FIX_PER_LEAGUE} por liga)`);
    console.log(`  (Para reparar más: node scripts/auditAndRepair.mjs --details-only --max-fix=50)\n`);

    let success = 0;
    let failed = 0;

    for (let i = 0; i < toFix.length; i++) {
        const m = toFix[i];
        console.log(`\n  [${i + 1}/${toFix.length}] Fixture ID: ${m.id}`);
        console.log(`    Missing: ${[m.missingEvents && 'events', m.missingStats && 'stats', m.missingLineup && 'lineups'].filter(Boolean).join(', ')}`);

        const fixtureId = parseInt(m.id);
        const ok = await syncFixtureDetails(fixtureId);
        if (ok) { success++; }
        else     { failed++; }
    }

    report.repairs = { attempted: toFix.length, success, failed };
    console.log(`\n  → Reparados: ${success}/${toFix.length} (${failed} fallidos)`);
}

// ─── Core: sync one fixture's details (lineups, stats, events, H2H) ───────
async function syncFixtureDetails(fixtureId) {
    try {
        // Fetch all in parallel to save time (but respect rate limit via our wrapper)
        console.log(`    → Fetching lineups...`);
        const lineups = await fetchFromApi('fixtures/lineups', { fixture: fixtureId });

        console.log(`    → Fetching stats...`);
        const stats = await fetchFromApi('fixtures/statistics', { fixture: fixtureId });

        console.log(`    → Fetching events...`);
        const events = await fetchFromApi('fixtures/events', { fixture: fixtureId });

        console.log(`    → Fetching predictions...`);
        const predictions = await fetchFromApi('predictions', { fixture: fixtureId });

        // Map lineups (with null safety for player.id and player.pos)
        const safeMapXI = (list) => (list || []).map(item => ({
            player: { id: item.player?.id != null ? item.player.id.toString() : '0', name: item.player?.name || '' },
            pos: mapPos(item.player?.pos),
            grid: item.player?.grid || '1:1',
            number: item.player?.number || null
        }));

        const lineup_home = lineups && lineups[0] ? {
            teamId: lineups[0].team?.id?.toString() || '0',
            formation: lineups[0].formation || '',
            startXI: safeMapXI(lineups[0].startXI),
            substitutes: safeMapXI(lineups[0].substitutes),
            staff: lineups[0].coach ? [{ name: lineups[0].coach.name, role: 'Head Coach' }] : []
        } : null;

        const lineup_away = lineups && lineups[1] ? {
            teamId: lineups[1].team?.id?.toString() || '0',
            formation: lineups[1].formation || '',
            startXI: safeMapXI(lineups[1].startXI),
            substitutes: safeMapXI(lineups[1].substitutes),
            staff: lineups[1].coach ? [{ name: lineups[1].coach.name, role: 'Head Coach' }] : []
        } : null;

        // Map stats
        const findStatVal = (statsList, type) => {
            if (!statsList) return 0;
            const stat = statsList.find(s => s.type === type);
            if (!stat || stat.value === null || stat.value === undefined) return 0;
            if (typeof stat.value === 'string' && stat.value.endsWith('%')) {
                return parseInt(stat.value.replace('%', ''));
            }
            return parseInt(stat.value) || 0;
        };

        const homeStats = stats && stats[0] ? stats[0].statistics : null;
        const awayStats = stats && stats[1] ? stats[1].statistics : null;

        const mappedStats = stats && stats.length >= 2 ? {
            possession:  { home: findStatVal(homeStats, 'Ball Possession'),  away: findStatVal(awayStats, 'Ball Possession') },
            shots:       { home: findStatVal(homeStats, 'Total Shots'),       away: findStatVal(awayStats, 'Total Shots') },
            shotsOnGoal: { home: findStatVal(homeStats, 'Shots on Goal'),     away: findStatVal(awayStats, 'Shots on Goal') },
            passes:      { home: findStatVal(homeStats, 'Total passes'),      away: findStatVal(awayStats, 'Total passes') },
            corners:     { home: findStatVal(homeStats, 'Corner Kicks'),      away: findStatVal(awayStats, 'Corner Kicks') },
            passAccuracy:{ home: findStatVal(homeStats, 'Passes %'),          away: findStatVal(awayStats, 'Passes %') },
            fouls:       { home: findStatVal(homeStats, 'Fouls'),             away: findStatVal(awayStats, 'Fouls') },
            offsides:    { home: findStatVal(homeStats, 'Offsides'),          away: findStatVal(awayStats, 'Offsides') },
            yellowCards: { home: findStatVal(homeStats, 'Yellow Cards'),      away: findStatVal(awayStats, 'Yellow Cards') },
            redCards:    { home: findStatVal(homeStats, 'Red Cards'),         away: findStatVal(awayStats, 'Red Cards') }
        } : null;

        // Map events
        const mappedEvents = (events || []).map((e, idx) => ({
            id: `e-${fixtureId}-${idx}`,
            time: (e.time?.elapsed || 0) + (e.time?.extra || 0),
            type: e.type === 'Goal' ? 'GOAL'
                : e.type === 'Card' ? 'CARD'
                : e.type === 'subst' ? 'SUB'
                : e.type === 'Var' ? 'VAR'
                : 'OTHER',
            teamId: e.team?.id?.toString() || '0',
            player: {
                id: e.player?.id ? e.player.id.toString() : '0',
                name: e.player?.name || ''
            },
            assistPlayer: e.assist?.id ? {
                id: e.assist.id.toString(),
                name: e.assist.name || ''
            } : undefined,
            detail: (e.detail || '') + (e.comments ? ` (${e.comments})` : '')
        }));

        // Map predictions
        const mappedPrediction = predictions && predictions[0] ? {
            advice: predictions[0].predictions?.advice,
            percent: {
                home: predictions[0].predictions?.percent?.home,
                draw: predictions[0].predictions?.percent?.draw,
                away: predictions[0].predictions?.percent?.away
            },
            comparison: predictions[0].comparison ? {
                form: { home: predictions[0].comparison.form?.home, away: predictions[0].comparison.form?.away },
                att:  { home: predictions[0].comparison.att?.home,  away: predictions[0].comparison.att?.away },
                def:  { home: predictions[0].comparison.def?.home,  away: predictions[0].comparison.def?.away }
            } : null
        } : null;

        // Get current metadata (to preserve existing fields)
        const { data: matchObj } = await supabase
            .from('matches')
            .select('metadata, home_team, away_team, home_team_logo, away_team_logo')
            .eq('id', fixtureId.toString())
            .single();

        const currentMeta = matchObj?.metadata || {};
        const homeId = currentMeta.home_id;
        const awayId = currentMeta.away_id;

        // Fetch H2H if we have team IDs
        let mappedH2h = currentMeta.h2h || [];
        if (homeId && awayId && mappedH2h.length === 0) {
            console.log(`    → Fetching H2H (${homeId} vs ${awayId})...`);
            const h2h = await fetchFromApi('fixtures/headtohead', { h2h: `${homeId}-${awayId}`, last: 5 });
            if (h2h && h2h.length > 0) {
                mappedH2h = h2h.slice(0, 5).map(item => ({
                    competition: `${item.league.name} - ${item.league.round}`,
                    result: `${item.teams.home.name} ${item.goals.home} - ${item.goals.away} ${item.teams.away.name}`,
                    date: item.fixture.date.split('T')[0]
                }));
            }
        }

        const updatedMeta = {
            ...currentMeta,
            lineup_home: lineup_home || currentMeta.lineup_home,
            lineup_away: lineup_away || currentMeta.lineup_away,
            stats: mappedStats || currentMeta.stats,
            events: mappedEvents.length > 0 ? mappedEvents : currentMeta.events,
            ai_prediction: mappedPrediction || currentMeta.ai_prediction,
            h2h: mappedH2h
        };

        const { error: updateError } = await supabase
            .from('matches')
            .update({ metadata: updatedMeta })
            .eq('id', fixtureId.toString());

        if (updateError) {
            console.error(`    ❌ Error updating fixture ${fixtureId}:`, updateError.message);
            return false;
        } else {
            const synced = [
                lineup_home ? '✓lineups' : '✗lineups',
                mappedStats ? '✓stats' : '✗stats',
                mappedEvents.length > 0 ? `✓events(${mappedEvents.length})` : '✗events'
            ].join(' ');
            console.log(`    ✅ Fixture ${fixtureId} synced: ${synced}`);
            return true;
        }
    } catch (err) {
        console.error(`    ❌ Exception syncing fixture ${fixtureId}:`, err.message);
        return false;
    }
}

// ─── STEP 5: Audit league-team relationships ───────────────────────────────
async function auditLeagueTeams(report) {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  PASO 5: Auditando tabla LEAGUE_TEAMS');
    console.log('═══════════════════════════════════════════════════════');

    const { data: lt, error } = await supabase
        .from('league_teams')
        .select('league_id, team_id, season');

    if (error) {
        console.error('❌ Error fetching league_teams:', error.message);
        return;
    }

    // Group by league
    const byLeague = new Map();
    for (const row of lt) {
        if (!byLeague.has(row.league_id)) byLeague.set(row.league_id, []);
        byLeague.get(row.league_id).push(row.team_id);
    }

    console.log(`  Total relaciones league-team: ${lt.length}`);
    console.log('\n  Por liga:');

    const leaguesToCheck = LEAGUE_FILTER
        ? LEAGUES_CONFIG.filter(l => l.dbId === LEAGUE_FILTER)
        : LEAGUES_CONFIG;

    const emptyLeagues = [];
    for (const cfg of leaguesToCheck) {
        const teams = byLeague.get(cfg.dbId) || [];
        const statusIcon = teams.length === 0 ? '❌' : teams.length < 5 ? '⚠️ ' : '✅';
        console.log(`    ${statusIcon} ${cfg.dbId}: ${teams.length} equipos`);
        if (teams.length === 0) emptyLeagues.push(cfg);
    }

    report.leagueTeams = { total: lt.length, emptyLeagues: emptyLeagues.map(l => l.dbId) };

    if (emptyLeagues.length > 0) {
        console.log(`\n  ⚠️  ${emptyLeagues.length} ligas sin equipos asociados.`);
        console.log(`  Para repoblar: node scripts/syncSupabaseFromApi.mjs --all`);
    }
}

// ─── STEP 6: Audit standings ───────────────────────────────────────────────
async function auditStandings(report) {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  PASO 6: Auditando tabla STANDINGS');
    console.log('═══════════════════════════════════════════════════════');

    const { data: standings, error } = await supabase
        .from('standings')
        .select('league_id, season, team_id');

    if (error) {
        console.error('❌ Error fetching standings:', error.message);
        return;
    }

    const byLeague = new Map();
    for (const row of standings) {
        const key = `${row.league_id}-${row.season}`;
        if (!byLeague.has(key)) byLeague.set(key, 0);
        byLeague.set(key, byLeague.get(key) + 1);
    }

    console.log(`  Total entradas de standings: ${standings.length}`);
    console.log('\n  Por liga-temporada:');

    const leaguesToCheck = LEAGUE_FILTER
        ? LEAGUES_CONFIG.filter(l => l.dbId === LEAGUE_FILTER)
        : LEAGUES_CONFIG;

    const emptyStandings = [];
    for (const cfg of leaguesToCheck) {
        const count = byLeague.get(`${cfg.dbId}-${cfg.season}`) || 0;
        const icon = count === 0 ? '❌' : count < 4 ? '⚠️ ' : '✅';
        console.log(`    ${icon} ${cfg.dbId} (${cfg.season}): ${count} entradas`);
        if (count === 0) emptyStandings.push(cfg);
    }

    report.standings = { total: standings.length, emptyStandings: emptyStandings.map(l => l.dbId) };

    if (emptyStandings.length > 0) {
        console.log(`\n  ⚠️  ${emptyStandings.length} ligas sin standings. Para sincronizar:`);
        console.log(`  node scripts/syncSupabaseFromApi.mjs --all`);
    }
}

// ─── MAIN ──────────────────────────────────────────────────────────────────
async function main() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║   🔍 AUDITORÍA Y REPARACIÓN DE DATOS - JugatelaSports ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log(`Mode: ${FIX_ALL ? '--fix-all' : DETAILS_ONLY ? '--details-only' : 'default'}`);
    console.log(`League filter: ${LEAGUE_FILTER || 'ALL'}`);
    console.log(`Max fixtures to repair per league: ${MAX_FIX_PER_LEAGUE}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    await authenticateAsAdmin();

    const report = {};

    if (!DETAILS_ONLY) {
        await auditLeagues(report);
        await auditTeams(report);
    }

    const finishedMissingDetails = await auditMatches(report);
    await repairMatchDetails(finishedMissingDetails, report);

    if (!DETAILS_ONLY) {
        await auditLeagueTeams(report);
        await auditStandings(report);
    }

    // ─── Final Report ────────────────────────────────────────────────────
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║                    📋 REPORTE FINAL                   ║');
    console.log('╚═══════════════════════════════════════════════════════╝');

    if (report.leagues) {
        console.log(`\n🏆 LIGAS: ${report.leagues.issues} problemas, ${report.leagues.fixed} corregidos`);
    }
    if (report.teams) {
        console.log(`\n👕 EQUIPOS: ${report.teams.total} total | ${report.teams.noLogo} sin logo | ${report.teams.noShortName} sin short_name`);
        if (report.teams.fixed) console.log(`   → ${report.teams.fixed} equipos reparados`);
    }
    if (report.matches) {
        console.log(`\n⚽ PARTIDOS: ${report.matches.total} total`);
        console.log(`   Estados: ${JSON.stringify(report.matches.statusCounts)}`);
        console.log(`   league_id numéricos: ${report.matches.wrongLeagueId} → corregidos: ${report.matches.leagueIdFixed || 0}`);
        console.log(`   FINISHED sin detalles: ${report.matches.finishedMissingDetails}`);
    }
    if (report.repairs) {
        console.log(`\n🔧 REPARACIONES: ${report.repairs.attempted} intentados, ${report.repairs.success} exitosos, ${report.repairs.failed} fallidos`);
        if (report.repairs.attempted < (report.matches?.finishedMissingDetails || 0)) {
            const remaining = (report.matches?.finishedMissingDetails || 0) - report.repairs.success;
            console.log(`   ⚠️  Quedan ${remaining} partidos sin detalles. Ejecutar de nuevo para continuar.`);
            console.log(`   → node scripts/auditAndRepair.mjs --details-only --max-fix=${MAX_FIX_PER_LEAGUE}`);
        }
    }
    if (report.leagueTeams) {
        console.log(`\n🔗 LEAGUE_TEAMS: ${report.leagueTeams.total} relaciones`);
        if (report.leagueTeams.emptyLeagues.length > 0) {
            console.log(`   ❌ Sin equipos: ${report.leagueTeams.emptyLeagues.join(', ')}`);
        }
    }
    if (report.standings) {
        console.log(`\n📊 STANDINGS: ${report.standings.total} entradas`);
        if (report.standings.emptyStandings.length > 0) {
            console.log(`   ❌ Sin datos: ${report.standings.emptyStandings.join(', ')}`);
        }
    }

    console.log('\n✅ Auditoría completada.\n');
    process.exit(0);
}

main().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
