
import { supabase } from '../lib/supabase';
import { databaseService } from './databaseService';

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
}

export const predictionService = {
    async savePrediction(prediction: PredictionData) {
        try {
            // Evaluamos selection clásica por si la tabla aun requiere que no sea nula en alguna versión
            const selection = prediction.homeScore > prediction.awayScore ? 'HOME' :
                prediction.homeScore < prediction.awayScore ? 'AWAY' : 'DRAW';

            const { error, data } = await supabase
                .from('predictions')
                .upsert({
                    user_id: prediction.userId,
                    match_id: prediction.matchId,
                    selection: selection,
                    stake: prediction.stake,
                    potential_return: 0, 
                    home_score_pred: prediction.homeScore,
                    away_score_pred: prediction.awayScore,
                    opponent_type: prediction.opponentType || 'CPU',
                    opponent_id: prediction.opponentId || null,
                    wager_item_id: prediction.wagerItemId || null,
                    booster_id: prediction.boosterId || null,
                    advance_method: prediction.advanceMethod || 'REGULAR',
                    status: 'PENDING'
                }, { onConflict: 'user_id,match_id' })
                .select()
                .single();

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
