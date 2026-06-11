import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const NATIONAL_TEAMS_POWER = {
    'México': { power: 77, att: 76, def: 75 },
    'Sudáfrica': { power: 65, att: 64, def: 64 }
};

async function enhance(matchData) {
        const homeName = matchData.home_team;
        const awayName = matchData.away_team;
        const matchId = matchData.id;

        if (!matchData.metadata) matchData.metadata = {};

        let h2hMatches = [];
        if (!matchData.metadata.h2h || matchData.metadata.h2h.length === 0) {
            const { data: h2hData, error } = await supabase
                .from('matches')
                .select('*')
                .or(nd(home_team.eq."+homeName+",away_team.eq."+awayName+"),and(home_team.eq."+awayName+",away_team.eq."+homeName+"))
                .eq('status', 'FINISHED')
                .neq('id', matchId)
                .not('home_score', 'is', null)
                .order('start_time', { ascending: false })
                .limit(5);

            if (error) throw error;
            if (h2hData && h2hData.length > 0) h2hMatches = h2hData;
        }

        if (!matchData.metadata.ai_prediction) {
            const { data: homeRecent, error: he } = await supabase
                .from('matches')
                .select('home_team, away_team, home_score, away_score')
                .or(home_team.eq."+homeName+",away_team.eq."+homeName+")
                .eq('status', 'FINISHED')
                .neq('id', matchId)
                .not('home_score', 'is', null)
                .order('start_time', { ascending: false })
                .limit(5);

            if (he) throw he;
            const { data: awayRecent, error: ae } = await supabase
                .from('matches')
                .select('home_team, away_team, home_score, away_score')
                .or(home_team.eq."+awayName+",away_team.eq."+awayName+")
                .eq('status', 'FINISHED')
                .neq('id', matchId)
                .not('home_score', 'is', null)
                .order('start_time', { ascending: false })
                .limit(5);
            if (ae) throw ae;

            let homeFormScore = 50; 
            let awayFormScore = 50;

            const calculateForm = (recent, teamName) => {
                let score = 50;
                let goalsScored = 0;
                let goalsConceded = 0;
                if (!recent || recent.length === 0) {
                    const powerInfo = (NATIONAL_TEAMS_POWER)[teamName];
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
            
            console.log("homeStats", homeStats);
            console.log("awayStats", awayStats);

            const usedPowerRankings = homeStats.fromPowerRankings || awayStats.fromPowerRankings;

            let homeProb = 33;
            let drawProb = 34;
            let awayProb = 33;
            const formDiff = homeFormScore - awayFormScore;
            
            homeProb = Math.round(50 + formDiff * 0.4);
            awayProb = Math.round(50 - formDiff * 0.4);
            homeProb += 5;
            awayProb -= 3;
            
            homeProb = Math.max(5, Math.min(85, homeProb));
            awayProb = Math.max(5, Math.min(85, awayProb));
            drawProb = 100 - homeProb - awayProb;
            
            if (drawProb < 10) {
                drawProb = 15;
                const diff = 100 - (homeProb + awayProb + drawProb);
                homeProb += diff / 2;
                awayProb += diff / 2;
            }

            const attackHome = Math.min(100, Math.max(10, Math.round((homeStats.goalsScored / 5) * 40)));
            const attackAway = Math.min(100, Math.max(10, Math.round((awayStats.goalsScored / 5) * 40)));
            const defHome = Math.min(100, Math.max(10, Math.round(100 - (homeStats.goalsConceded / 5) * 40)));
            const defAway = Math.min(100, Math.max(10, Math.round(100 - (awayStats.goalsConceded / 5) * 40)));

            matchData.metadata.ai_prediction = {
                percent: {
                    home: Math.round(homeProb) + "%",
                    draw: Math.round(drawProb) + "%",
                    away: Math.round(awayProb) + "%"
                },
                comparison: {
                    form: { home: Math.round(homeFormScore) + "%", away: Math.round(awayFormScore) + "%" },
                    att: { home: attackHome + "%", away: attackAway + "%" },
                    def: { home: defHome + "%", away: defAway + "%" }
                }
            };
        }
        return matchData;
}

async function run() {
    try {
        const { data } = await supabase.from('matches').select('*').eq('id', 'm1').single();
        const res = await enhance(data);
        console.log("Prediction:", res.metadata.ai_prediction);
    } catch(e) { console.error("ERROR", e); }
}
run();
