import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const NATIONAL_TEAMS_POWER = {
    'Argentina': { power: 94, att: 88, def: 85 },
    'Francia': { power: 92, att: 89, def: 82 },
    'Brasil': { power: 90, att: 86, def: 81 },
    'Inglaterra': { power: 89, att: 85, def: 83 },
    'España': { power: 88, att: 83, def: 84 },
    'Portugal': { power: 87, att: 85, def: 81 },
    'Alemania': { power: 86, att: 82, def: 80 },
    'Italia': { power: 85, att: 80, def: 86 },
    'Países Bajos': { power: 84, att: 81, def: 82 },
    'Bélgica': { power: 83, att: 82, def: 78 },
    'Uruguay': { power: 82, att: 80, def: 83 },
    'Croacia': { power: 81, att: 78, def: 80 },
    'Marruecos': { power: 80, att: 76, def: 84 },
    'Colombia': { power: 79, att: 78, def: 77 },
    'Senegal': { power: 78, att: 77, def: 78 },
    'México': { power: 77, att: 76, def: 75 },
    'USA': { power: 76, att: 75, def: 75 },
    'Japón': { power: 75, att: 74, def: 74 },
    'Suiza': { power: 74, att: 73, def: 76 },
    'Ecuador': { power: 73, att: 72, def: 75 },
    'Corea del Sur': { power: 72, att: 73, def: 71 },
    'Australia': { power: 71, att: 70, def: 72 },
    'Irán': { power: 70, att: 71, def: 69 },
    'Canadá': { power: 69, att: 72, def: 68 },
    'Costa Rica': { power: 68, att: 65, def: 70 },
    'Paraguay': { power: 67, att: 65, def: 68 },
    'Sudáfrica': { power: 65, att: 64, def: 64 }
};

async function forceGenerateOracles() {
    console.log("Fetching all SCHEDULED matches...");
    const { data: matches } = await supabase.from('matches').select('*').eq('status', 'SCHEDULED');
    
    if (!matches) {
        console.log("No matches found.");
        return;
    }
    
    let updatedCount = 0;

    for (let match of matches) {
        try {
            if (match.metadata && match.metadata.ai_prediction) {
                // Already has prediction, skip or overwrite? Let's overwrite to be sure
                // Actually, let's just generate for all
            }

            const homeName = match.home_team;
            const awayName = match.away_team;
            const matchId = match.id;

            let h2hMatches = [];
            const { data: h2hData } = await supabase
                .from('matches')
                .select('*')
                .or('and(home_team.eq."' + homeName + '",away_team.eq."' + awayName + '"),and(home_team.eq."' + awayName + '",away_team.eq."' + homeName + '")')
                .eq('status', 'FINISHED')
                .neq('id', matchId)
                .not('home_score', 'is', null)
                .order('start_time', { ascending: false })
                .limit(5);

            if (h2hData && h2hData.length > 0) h2hMatches = h2hData;

            const { data: homeRecent } = await supabase.from('matches').select('home_team, away_team, home_score, away_score')
                .or('home_team.eq."' + homeName + '",away_team.eq."' + homeName + '"').eq('status', 'FINISHED').neq('id', matchId).not('home_score', 'is', null).order('start_time', { ascending: false }).limit(5);

            const { data: awayRecent } = await supabase.from('matches').select('home_team, away_team, home_score, away_score')
                .or('home_team.eq."' + awayName + '",away_team.eq."' + awayName + '"').eq('status', 'FINISHED').neq('id', matchId).not('home_score', 'is', null).order('start_time', { ascending: false }).limit(5);

            const calculateForm = (recent, teamName) => {
                let score = 50;
                let goalsScored = 0;
                let goalsConceded = 0;
                if (!recent || recent.length === 0) {
                    const powerInfo = NATIONAL_TEAMS_POWER[teamName] || NATIONAL_TEAMS_POWER[teamName.replace('é','e').replace('á','a')];
                    if (powerInfo) {
                        return { score: powerInfo.power, goalsScored: Math.round(powerInfo.att / 10), goalsConceded: Math.round((100 - powerInfo.def) / 10), fromPowerRankings: true };
                    }
                    return { score, goalsScored, goalsConceded, fromPowerRankings: false };
                }
                recent.forEach(m => {
                    const isHome = m.home_team === teamName;
                    const teamScore = isHome ? m.home_score : m.away_score;
                    const oppScore = isHome ? m.away_score : m.home_score;
                    goalsScored += teamScore;
                    goalsConceded += oppScore;
                    if (teamScore > oppScore) score += 10;
                    else if (teamScore === oppScore) score += 3;
                    else score -= 8;
                });
                return { score: Math.max(10, Math.min(90, score)), goalsScored, goalsConceded, fromPowerRankings: false };
            };

            const homeStats = calculateForm(homeRecent || [], homeName);
            const awayStats = calculateForm(awayRecent || [], awayName);

            let homeH2HWins = 0;
            let awayH2HWins = 0;
            let draws = 0;
            if (h2hMatches.length > 0) {
                h2hMatches.forEach(m => {
                    if (m.home_score > m.away_score) m.home_team === homeName ? homeH2HWins++ : awayH2HWins++;
                    else if (m.home_score < m.away_score) m.home_team === homeName ? awayH2HWins++ : homeH2HWins++;
                    else draws++;
                });
            }

            let homeProb = 33; let drawProb = 34; let awayProb = 33;
            const formDiff = homeStats.score - awayStats.score;
            if (h2hMatches.length > 0) {
                const totalH2H = h2hMatches.length;
                const h2hDiff = ((homeH2HWins / totalH2H) * 100) - ((awayH2HWins / totalH2H) * 100);
                homeProb = Math.round(50 + (formDiff * 0.6) + (h2hDiff * 0.4));
                awayProb = Math.round(50 - (formDiff * 0.6) - (h2hDiff * 0.4));
                homeProb += 5; awayProb -= 3;
            } else {
                homeProb = Math.round(50 + formDiff * 0.4);
                awayProb = Math.round(50 - formDiff * 0.4);
                homeProb += 5; awayProb -= 3;
            }
            homeProb = Math.max(5, Math.min(85, homeProb));
            awayProb = Math.max(5, Math.min(85, awayProb));
            drawProb = 100 - homeProb - awayProb;
            if (drawProb < 10) { drawProb = 15; const diff = 100 - (homeProb + awayProb + drawProb); homeProb += diff / 2; awayProb += diff / 2; }

            const attackHome = Math.min(100, Math.max(10, Math.round((homeStats.goalsScored / 5) * 40)));
            const attackAway = Math.min(100, Math.max(10, Math.round((awayStats.goalsScored / 5) * 40)));
            const defHome = Math.min(100, Math.max(10, Math.round(100 - (homeStats.goalsConceded / 5) * 40)));
            const defAway = Math.min(100, Math.max(10, Math.round(100 - (awayStats.goalsConceded / 5) * 40)));

            const predictedScore = homeProb > awayProb + 15 ? '2-0' : awayProb > homeProb + 15 ? '1-2' : drawProb > 30 ? '1-1' : '2-1';

            let advice = "";
            const usedPowerRankings = homeStats.fromPowerRankings || awayStats.fromPowerRankings;
            if (h2hMatches.length > 0) {
                if (homeH2HWins > awayH2HWins) advice = homeName + ' domina el historial reciente. ';
                else if (awayH2HWins > homeH2HWins) advice = awayName + ' tiene ventaja histórica. ';
                else advice = 'El historial reciente está sumamente igualado. ';

                if (homeStats.score > awayStats.score + 15) advice += 'Además, llegan con mucha mejor forma individual y la localía a su favor. Local es amplio favorito.';
                else if (awayStats.score > homeStats.score + 15) advice += 'Sin embargo, la visita llega con una forma excelente que podría revertir la tendencia. Partido peligroso.';
                else advice += 'Ambos equipos llegan con un nivel similar, lo que augura un duelo cerrado.';
            } else {
                if (usedPowerRankings) {
                    advice = 'Análisis basado en métricas de selecciones nacionales para el Mundial. ';
                    if (homeStats.score > awayStats.score + 10) advice += homeName + ' tiene una plantilla estadísticamente superior y llega como claro favorito para llevarse el encuentro.';
                    else if (awayStats.score > homeStats.score + 10) advice += 'El poderío de ' + awayName + ' supera claramente a su rival. A pesar de todo, son amplios favoritos para ganar.';
                    else advice += 'Ambas selecciones tienen un poderío y estadísticas muy similares. Se pronostica un partido táctico y muy parejo.';
                } else {
                    advice = 'No hay enfrentamientos previos recientes registrados. ';
                    if (homeStats.score > awayStats.score + 10) advice += 'Basados en la forma de los últimos 5 partidos, ' + homeName + ' se perfila como sólido favorito gracias a su gran racha.';
                    else if (awayStats.score > homeStats.score + 10) advice += awayName + ' llega con mucho mejor nivel individual. A pesar de ser visitantes, son favoritos.';
                    else advice += 'Ambos clubes han tenido un rendimiento irregular. Se espera un partido muy parejo y el empate es altamente probable.';
                }
            }

            const ai_prediction = {
                advice: advice,
                percent: { home: Math.round(homeProb) + '%', draw: Math.round(drawProb) + '%', away: Math.round(awayProb) + '%' },
                comparison: {
                    form: { home: Math.round(homeStats.score) + '%', away: Math.round(awayStats.score) + '%' },
                    att: { home: attackHome + '%', away: attackAway + '%' },
                    def: { home: defHome + '%', away: defAway + '%' }
                },
                predictedScore: predictedScore,
                keyFactors: [
                    h2hMatches.length > 0 ? 'Historial directo analizado' : (usedPowerRankings ? 'Ranking FIFA y métricas de selecciones' : 'Sin historial directo - Análisis individual puro'),
                    usedPowerRankings ? 'Poderío ofensivo y solidez defensiva base' : 'Rendimiento de los últimos 5 partidos',
                    'Ventaja de localía calculada',
                    'Efectividad goleadora y solidez defensiva'
                ]
            };

            const meta = match.metadata || {};
            meta.ai_prediction = ai_prediction;

            const { error: updateError } = await supabase.from('matches').update({ metadata: meta }).eq('id', match.id);
            if (!updateError) updatedCount++;
        } catch (e) {
            console.error("Failed for " + match.home_team, e);
        }
    }
    console.log("Updated", updatedCount, "matches with pre-calculated Oracle!");
}
forceGenerateOracles();
