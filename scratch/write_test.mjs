const fs = require('fs');
const content = 
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const NATIONAL_TEAMS_POWER = {
    'Argentina': { power: 94, att: 88, def: 85 },
    'Tristan Suarez': { power: 60, att: 60, def: 60 }
};

async function enhanceMatchWithDynamicData(matchData) {
    if (!matchData) return matchData;
    try {
        const homeName = matchData.home_team;
        const awayName = matchData.away_team;
        const matchId = matchData.id;

        const homePowerInfo = (NATIONAL_TEAMS_POWER)[homeName];
        const awayPowerInfo = (NATIONAL_TEAMS_POWER)[awayName];

        if (!matchData.metadata) {
            matchData.metadata = {};
        }

        let h2hMatches = [];
        if (!matchData.metadata.h2h || matchData.metadata.h2h.length === 0) {
            const { data: h2hData } = await supabase
                .from('matches')
                .select('*')
                .or('and(home_team.eq."' + homeName + '",away_team.eq."' + awayName + '"),and(home_team.eq."' + awayName + '",away_team.eq."' + homeName + '")')
                .eq('status', 'FINISHED')
                .neq('id', matchId)
                .not('home_score', 'is', null)
                .order('start_time', { ascending: false })
                .limit(5);

            if (h2hData && h2hData.length > 0) {
                h2hMatches = h2hData;
            }
        }

        if (!matchData.metadata.ai_prediction) {
            const { data: homeRecent, error: he } = await supabase
                .from('matches')
                .select('home_team, away_team, home_score, away_score')
                .or('home_team.eq."' + homeName + '",away_team.eq."' + homeName + '"')
                .eq('status', 'FINISHED')
                .neq('id', matchId)
                .not('home_score', 'is', null)
                .order('start_time', { ascending: false })
                .limit(5);

            if (he) console.log("HOME ERROR:", he);

            const { data: awayRecent, error: ae } = await supabase
                .from('matches')
                .select('home_team, away_team, home_score, away_score')
                .or('home_team.eq."' + awayName + '",away_team.eq."' + awayName + '"')
                .eq('status', 'FINISHED')
                .neq('id', matchId)
                .not('home_score', 'is', null)
                .order('start_time', { ascending: false })
                .limit(5);

            if (ae) console.log("AWAY ERROR:", ae);

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

            const attackHome = Math.round((homeStats.goalsScored / 5) * 100) || 50;
            const attackAway = Math.round((awayStats.goalsScored / 5) * 100) || 50;
            const defHome = Math.round(100 - (homeStats.goalsConceded / 5) * 100) || 50;
            const defAway = Math.round(100 - (awayStats.goalsConceded / 5) * 100) || 50;

            const predictedScore = "2-1";

            matchData.metadata.ai_prediction = {
                advice: "test",
                percent: {
                    home: Math.round(homeProb) + "%",
                    draw: Math.round(drawProb) + "%",
                    away: Math.round(awayProb) + "%"
                },
                comparison: {
                    form: { home: Math.round(homeFormScore) + "%", away: Math.round(awayFormScore) + "%" },
                    att: { home: attackHome + "%", away: attackAway + "%" },
                    def: { home: defHome + "%", away: defAway + "%" }
                },
                predictedScore: predictedScore,
                keyFactors: []
            };
        }
        return matchData;
    } catch (error) {
        console.error('Error enhancing match:', error);
        return matchData;
    }
}

async function testEngine() {
    const { data: m } = await supabase.from('matches').select('*').eq('id', '1498594').single();
    const result = await enhanceMatchWithDynamicData(m);
    console.log(JSON.stringify(result.metadata.ai_prediction, null, 2));
}
testEngine();
;
fs.writeFileSync('scratch/test_engine_full.mjs', content);
