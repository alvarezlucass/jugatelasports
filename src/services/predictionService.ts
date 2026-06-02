
import { supabase } from '../lib/supabase';
import { databaseService } from './databaseService';
import { WORLD_CUP_GROUP_MATCHES, WORLD_CUP_TEAMS_HISTORY } from '../data/worldCupPersistence';

export interface PredictionData {
    matchId: string;
    homeScore: number;
    awayScore: number;
    userId: string;
    stake: number;
    opponentType?: 'CPU' | 'FRIEND' | 'RANDOM' | 'COMMUNITY';
    opponentId?: string;
    wagerItemId?: string;
    boosterId?: string;
    advanceMethod?: 'REGULAR' | 'EXTRA' | 'PENALTIES';
    mockMatchDetails?: {
        homeTeam: string;
        awayTeam: string;
        date: string;
    };
}

export const predictionService = {
    async savePrediction(prediction: PredictionData) {
        try {
            // Auto-sync the match to DB if it's from the static data or dynamic mock
            let staticMatch = WORLD_CUP_GROUP_MATCHES.find(m => m.id === prediction.matchId);
            
            if (!staticMatch && prediction.mockMatchDetails) {
                // Generar un match on-the-fly para la base de datos
                staticMatch = {
                    id: prediction.matchId,
                    homeTeam: prediction.mockMatchDetails.homeTeam,
                    awayTeam: prediction.mockMatchDetails.awayTeam,
                    date: prediction.mockMatchDetails.date || new Date().toISOString().split('T')[0],
                    time: '00:00',
                    group: 'Generado Automáticamente',
                    stadium: 'TBD',
                    city: 'TBD',
                    status: 'scheduled',
                    homeScore: 0,
                    awayScore: 0,
                    h2h: []
                };
            }

            if (staticMatch) {
                await supabase.from('matches').upsert({
                    id: staticMatch.id,
                    league_id: 'auto-generated',
                    season: 2026,
                    home_team: staticMatch.homeTeam,
                    away_team: staticMatch.awayTeam,
                    start_time: `${staticMatch.date}T${staticMatch.time}:00Z`,
                    status: staticMatch.status.toUpperCase(),
                    home_score: staticMatch.homeScore || 0,
                    away_score: staticMatch.awayScore || 0,
                    metadata: {
                        group: staticMatch.group,
                        stadium: staticMatch.stadium,
                        city: staticMatch.city,
                        static_data: WORLD_CUP_TEAMS_HISTORY[staticMatch.homeTeam] || null
                    }
                }, { onConflict: 'id' });
            }

            // Evaluamos selection clásica por si la tabla aun requiere que no sea nula en alguna versión
            const selection = prediction.homeScore > prediction.awayScore ? 'HOME' :
                prediction.homeScore < prediction.awayScore ? 'AWAY' : 'DRAW';

            // Check if prediction already exists
            const { data: existing } = await supabase
                .from('predictions')
                .select('id')
                .eq('user_id', prediction.userId)
                .eq('match_id', prediction.matchId)
                .maybeSingle();

            const predictionObj = {
                user_id: prediction.userId,
                match_id: prediction.matchId,
                selection: selection,
                stake: prediction.stake,
                potential_return: 0,
                status: 'PENDING',
                metadata: {
                    exact_score: {
                        home: prediction.homeScore,
                        away: prediction.awayScore
                    },
                    opponent_type: prediction.opponentType || 'CPU',
                    opponent_id: prediction.opponentId || null
                }
            };

            let response;
            if (existing) {
                response = await supabase
                    .from('predictions')
                    .update(predictionObj)
                    .eq('id', existing.id)
                    .select()
                    .single();
            } else {
                response = await supabase
                    .from('predictions')
                    .insert([predictionObj])
                    .select()
                    .single();
            }

            const { error, data } = response;

            if (error) throw error;

            // Registrar Actividad Social
            await databaseService.recordActivity(prediction.userId, 'PREDICTION_MADE', {
                matchId: prediction.matchId,
                stake: prediction.stake
            });

            return { success: true, data };
        } catch (error) {
            console.error('Error saving prediction:', error);
            return { success: false, error };
        }
    },

    async getUserPredictions(userId: string) {
        const { data, error } = await supabase
            .from('predictions')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching predictions:', error);
            return [];
        }
        return data;
    }
};
