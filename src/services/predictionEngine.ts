import { supabase } from '../lib/supabase';
import { NATIONAL_TEAMS_POWER } from './powerRankings';

interface Match {
    id: string;
    home_team: string;
    away_team: string;
    home_score: number | null;
    away_score: number | null;
    start_time: string;
    league_id: string;
    status: string;
    metadata?: any;
}

export async function enhanceMatchWithDynamicData(matchData: Match) {
    if (!matchData) return matchData;

    try {
        const homeName = matchData.home_team;
        const awayName = matchData.away_team;
        const matchId = matchData.id;

        // Check if teams exist in power rankings
        const homePowerInfo = (NATIONAL_TEAMS_POWER as any)[homeName];
        const awayPowerInfo = (NATIONAL_TEAMS_POWER as any)[awayName];

        // Initialize metadata if not present
        if (!matchData.metadata) {
            matchData.metadata = {};
        }

        // 1. Fetch H2H from DB if not already present or empty
        let h2hMatches: any[] = [];
        if (!matchData.metadata.h2h || matchData.metadata.h2h.length === 0) {
            const { data: h2hData } = await supabase
                .from('matches')
                .select('*')
                .or(`and(home_team.eq."${homeName}",away_team.eq."${awayName}"),and(home_team.eq."${awayName}",away_team.eq."${homeName}")`)
                .eq('status', 'FINISHED')
                .neq('id', matchId)
                .not('home_score', 'is', null)
                .order('start_time', { ascending: false })
                .limit(5);

            if (h2hData && h2hData.length > 0) {
                h2hMatches = h2hData;
                matchData.metadata.h2h = h2hData.map(m => ({
                    date: m.start_time.split('T')[0],
                    homeTeam: m.home_team,
                    awayTeam: m.away_team,
                    homeScore: m.home_score,
                    awayScore: m.away_score,
                    competition: m.league_id || 'Liga'
                }));
            }
        } else {
            // Mock H2H matches array for AI calculation if it came from metadata
            h2hMatches = matchData.metadata.h2h.map((m: any) => ({
                home_team: m.homeTeam,
                away_team: m.awayTeam,
                home_score: m.homeScore,
                away_score: m.awayScore
            }));
        }

        // 2. Generate Oracle AI Prediction dynamically if missing
        if (!matchData.metadata.ai_prediction) {
            // Fetch recent form (last 5 matches) for both teams
            const { data: homeRecent } = await supabase
                .from('matches')
                .select('home_team, away_team, home_score, away_score')
                .or(`home_team.eq."${homeName}",away_team.eq."${homeName}"`)
                .eq('status', 'FINISHED')
                .neq('id', matchId)
                .not('home_score', 'is', null)
                .order('start_time', { ascending: false })
                .limit(5);

            const { data: awayRecent } = await supabase
                .from('matches')
                .select('home_team, away_team, home_score, away_score')
                .or(`home_team.eq."${awayName}",away_team.eq."${awayName}"`)
                .eq('status', 'FINISHED')
                .neq('id', matchId)
                .not('home_score', 'is', null)
                .order('start_time', { ascending: false })
                .limit(5);

            let homeFormScore = 50; // Base 50
            let awayFormScore = 50;

            const calculateForm = (recent: any[], teamName: string) => {
                let score = 50;
                let goalsScored = 0;
                let goalsConceded = 0;
                if (!recent || recent.length === 0) {
                    const powerInfo = (NATIONAL_TEAMS_POWER as any)[teamName];
                    if (powerInfo) {
                        return { 
                            score: powerInfo.power, 
                            goalsScored: Math.round(powerInfo.att / 10), 
                            goalsConceded: Math.round((100 - powerInfo.def) / 10),
                            fromPowerRankings: true
                        };
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

            homeFormScore = homeStats.score;
            awayFormScore = awayStats.score;

            const usedPowerRankings = homeStats.fromPowerRankings || awayStats.fromPowerRankings;

            // H2H calculation
            let homeH2HWins = 0;
            let awayH2HWins = 0;
            let draws = 0;

            if (h2hMatches && h2hMatches.length > 0) {
                h2hMatches.forEach(m => {
                    if (m.home_score > m.away_score) {
                        m.home_team === homeName ? homeH2HWins++ : awayH2HWins++;
                    } else if (m.home_score < m.away_score) {
                        m.home_team === homeName ? awayH2HWins++ : homeH2HWins++;
                    } else {
                        draws++;
                    }
                });
            }

            // Calculate Probabilities
            let homeProb = 33;
            let drawProb = 34;
            let awayProb = 33;

            // Weight Form (60%) and H2H (40% if exists, else Form is 100%)
            const formDiff = homeFormScore - awayFormScore; // Positive means home is better
            
            if (h2hMatches && h2hMatches.length > 0) {
                const totalH2H = homeH2HWins + awayH2HWins + draws;
                const homeH2HScore = ((homeH2HWins * 3) + draws) / (totalH2H * 3) * 100;
                const awayH2HScore = ((awayH2HWins * 3) + draws) / (totalH2H * 3) * 100;
                
                homeProb = Math.round((homeH2HScore * 0.4) + (Math.max(10, 50 + formDiff / 2) * 0.6));
                awayProb = Math.round((awayH2HScore * 0.4) + (Math.max(10, 50 - formDiff / 2) * 0.6));
                
                // Add home advantage
                homeProb += 5;
                awayProb -= 3;
            } else {
                homeProb = Math.round(50 + formDiff * 0.4);
                awayProb = Math.round(50 - formDiff * 0.4);
                
                // Add home advantage
                homeProb += 5;
                awayProb -= 3;
            }

            // Normalize
            homeProb = Math.max(5, Math.min(85, homeProb));
            awayProb = Math.max(5, Math.min(85, awayProb));
            drawProb = 100 - homeProb - awayProb;
            
            if (drawProb < 10) {
                drawProb = 15;
                const diff = 100 - (homeProb + awayProb + drawProb);
                homeProb += diff / 2;
                awayProb += diff / 2;
            }

            // Generate Advice String
            let advice = "";
            if (h2hMatches && h2hMatches.length > 0) {
                if (homeH2HWins > awayH2HWins) {
                    advice = `${homeName} domina el historial reciente. `;
                } else if (awayH2HWins > homeH2HWins) {
                    advice = `${awayName} tiene ventaja histórica. `;
                } else {
                    advice = `El historial reciente está sumamente igualado. `;
                }

                if (homeFormScore > awayFormScore + 15) {
                    advice += `Además, llegan con mucha mejor forma individual y la localía a su favor. Local es amplio favorito.`;
                } else if (awayFormScore > homeFormScore + 15) {
                    advice += `Sin embargo, la visita llega con una forma excelente que podría revertir la tendencia. Partido peligroso.`;
                } else {
                    advice += `Ambos equipos llegan con un nivel similar, lo que augura un duelo cerrado.`;
                }
            } else {
                if (usedPowerRankings) {
                    advice = `Análisis basado en métricas de selecciones nacionales para el Mundial. `;
                    if (homeFormScore > awayFormScore + 10) {
                        advice += `${homeName} tiene una plantilla estadísticamente superior y llega como claro favorito para llevarse el encuentro.`;
                    } else if (awayFormScore > homeFormScore + 10) {
                        advice += `El poderío de ${awayName} supera claramente a su rival. A pesar de todo, son amplios favoritos para ganar.`;
                    } else {
                        advice += `Ambas selecciones tienen un poderío y estadísticas muy similares. Se pronostica un partido táctico y muy parejo.`;
                    }
                } else {
                    advice = `No hay enfrentamientos previos recientes registrados. `;
                    if (homeFormScore > awayFormScore + 10) {
                        advice += `Basados en la forma de los últimos 5 partidos, ${homeName} se perfila como sólido favorito gracias a su gran racha.`;
                    } else if (awayFormScore > homeFormScore + 10) {
                        advice += `${awayName} llega con mucho mejor nivel individual. A pesar de ser visitantes, son favoritos.`;
                    } else {
                        advice += `Ambos clubes han tenido un rendimiento irregular. Se espera un partido muy parejo y el empate es altamente probable.`;
                    }
                }
            }

            // Generate Predicted Score
            const expectedHomeGoals = Math.max(0, Math.round((homeStats.goalsScored / 5) * 1.2 - (awayStats.goalsConceded / 5) * 0.8));
            const expectedAwayGoals = Math.max(0, Math.round((awayStats.goalsScored / 5) * 1.0 - (homeStats.goalsConceded / 5) * 0.8));
            
            const predictedScore = homeProb > awayProb + 15 
                ? `2-0` 
                : awayProb > homeProb + 15 
                ? `1-2` 
                : drawProb > 30 ? `1-1` : `2-1`;

            const attackHome = Math.min(100, Math.max(10, Math.round((homeStats.goalsScored / 5) * 40)));
            const attackAway = Math.min(100, Math.max(10, Math.round((awayStats.goalsScored / 5) * 40)));
            const defHome = Math.min(100, Math.max(10, Math.round(100 - (homeStats.goalsConceded / 5) * 40)));
            const defAway = Math.min(100, Math.max(10, Math.round(100 - (awayStats.goalsConceded / 5) * 40)));

            matchData.metadata.ai_prediction = {
                advice: advice,
                percent: {
                    home: `${Math.round(homeProb)}%`,
                    draw: `${Math.round(drawProb)}%`,
                    away: `${Math.round(awayProb)}%`
                },
                comparison: {
                    form: { home: `${Math.round(homeFormScore)}%`, away: `${Math.round(awayFormScore)}%` },
                    att: { home: `${attackHome}%`, away: `${attackAway}%` },
                    def: { home: `${defHome}%`, away: `${defAway}%` }
                },
                predictedScore: predictedScore,
                keyFactors: [
                    h2hMatches.length > 0 ? "Historial directo analizado" : (usedPowerRankings ? "Ranking FIFA y métricas de selecciones" : "Sin historial directo - Análisis individual puro"),
                    usedPowerRankings ? "Poderío ofensivo y solidez defensiva base" : "Rendimiento de los últimos 5 partidos",
                    "Ventaja de localía calculada",
                    "Efectividad goleadora y solidez defensiva"
                ]
            };
        }

        return matchData;
    } catch (e) {
        console.error("Error enhancing match data with Dynamic Oracle:", e);
        return matchData;
    }
}
