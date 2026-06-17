import { supabase } from '../lib/supabase';
import { WORLD_CUP_TEAMS_HISTORY, WORLD_CUP_GROUP_MATCHES } from '../data/worldCupPersistence';
import { calculatePoints } from '../utils/pointsCalculator';

export const databaseService = {
    /**
     * Sincroniza los datos estáticos de selecciones a la tabla 'teams' o similar.
     * Nota: En el schema actual no hay tabla 'teams', por lo que usaremos metadata en matches
     * o propondremos una tabla nueva si es necesario. Por ahora, sincronizaremos los partidos.
     */
    async syncWorldCupData() {
        console.log('Iniciando sincronización de datos del Mundial...');

        try {
            // Sincronizar Partidos
            const matchesToSync = WORLD_CUP_GROUP_MATCHES.map(m => ({
                id: m.id,
                league_id: 'world-cup-2026',
                season: 2026,
                home_team: m.homeTeam,
                away_team: m.awayTeam,
                start_time: `${m.date}T${m.time}:00Z`,
                status: m.status.toUpperCase(),
                home_score: m.homeScore || 0,
                away_score: m.awayScore || 0,
                metadata: {
                    group: m.group,
                    stadium: m.stadium,
                    city: m.city,
                    static_data: WORLD_CUP_TEAMS_HISTORY[m.homeTeam] || null
                }
            }));

            const { error: matchError } = await supabase
                .from('matches')
                .upsert(matchesToSync, { onConflict: 'id' });

            if (matchError) throw matchError;

            console.log('Partidos sincronizados correctamente.');
            return { success: true };
        } catch (error) {
            console.error('Error en sincronización:', error);
            return { success: false, error };
        }
    },

    /**
     * Obtiene los detalles de un partido desde la DB, incluyendo metadata táctica.
     */
    async fetchMatchDetail(matchId: string) {
        try {
            const { data, error } = await supabase
                .from('matches')
                .select('*')
                .eq('id', matchId)
                .single();

            if (error) throw error;
            
            // Enhancing with dynamic H2H and Oracle prediction
            const { enhanceMatchWithDynamicData } = await import('./predictionEngine');
            const enhancedData = await enhanceMatchWithDynamicData(data);

            return { success: true, data: enhancedData };
        } catch (error) {
            console.error('Error al obtener detalle del partido:', error);
            return { success: false, error };
        }
    },

    /**
     * Resuelve un partido y otorga puntos a todos los usuarios que predijeron.
     * Basado en el motor 3-2-1.
     */
    /**
     * Resuelve un partido y otorga puntos a todos los usuarios que predijeron.
     * Basado en el motor 3-2-1.
     */
    async resolveMatch(matchId: string, homeScore: number, awayScore: number, definition: 'REGULAR' | 'EXTRA_TIME' | 'PENALTIES' = 'REGULAR') {
        try {
            console.log(`Resolviendo partido ${matchId}...`);
            
            // 1. Obtener todas las predicciones pendientes para este partido
            const { data: predictions, error: predError } = await supabase
                .from('predictions')
                .select('*')
                .eq('match_id', matchId)
                .eq('status', 'PENDING');

            if (predError) throw predError;

            // 2. Procesar cada predicción
            const results = [];
            for (const pred of predictions) {
                // Adaptar predicción de DB a la interfaz del calculador
                const predData = {
                    score: { home: pred.home_score_pred || 0, away: pred.away_score_pred || 0 },
                    outcome: pred.selection as any,
                    definition: (pred.advance_method || 'REGULAR') as any
                };

                const actualData = {
                    score: { home: homeScore, away: awayScore },
                    definition: definition
                };

                const pointResult = calculatePoints(
                    predData,
                    actualData,
                    pred.advance_method !== 'REGULAR' 
                );

                // LOGICA DE BOOSTERS
                let finalPoints = pointResult.points;
                let refundAmount = 0;

                if (pred.booster_id) {
                    const { data: booster } = await supabase
                        .from('store_items')
                        .select('booster_effect')
                        .eq('id', pred.booster_id)
                        .single();
                    
                    if (booster?.booster_effect) {
                        const effect = booster.booster_effect as any;
                        if (effect.type === 'MULTIPLIER' && finalPoints > 0) {
                            finalPoints *= effect.value;
                        } else if (effect.type === 'REFUND' && finalPoints === 0) {
                            refundAmount = Math.floor(pred.stake * effect.value);
                        }
                    }
                }

                if (finalPoints > 0 || refundAmount > 0) {
                    // Obtener saldo y puntos actuales del perfil
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('total_balance, points')
                        .eq('id', pred.user_id)
                        .single();

                    if (profile) {
                        const creditedAmount = finalPoints + refundAmount;
                        const newBalance = (profile.total_balance || 0) + creditedAmount;
                        const newPoints = (profile.points || 0) + finalPoints;
                        
                        await supabase.from('profiles').update({ 
                            total_balance: newBalance,
                            points: newPoints 
                        }).eq('id', pred.user_id);
                        
                        await supabase.from('transactions').insert({
                            user_id: pred.user_id,
                            type: refundAmount > 0 ? 'BET_REFUND' : 'BET_WIN',
                            amount: creditedAmount,
                            description: refundAmount > 0 
                                ? `Reembolso Seguro: ${pred.stake} tokens (${matchId})`
                                : `Puntos Prode: ${pointResult.description} (x2 Booster!) (${matchId})`,
                            balance_after: newBalance,
                            balance_type: refundAmount > 0 ? 'REDEEMABLE' : 'LOCKED'
                        });

                        // 2.a Registrar Actividad Social si ganó puntos significativos
                        if (finalPoints >= 3) {
                            await this.recordActivity(pred.user_id, 'MATCH_WON', {
                                matchId: matchId,
                                points: finalPoints,
                                description: `${pointResult.description}${pred.booster_id ? ' (Boosted!)' : ''}`,
                                score: `${homeScore}-${awayScore}`
                            });
                        }

                        // 2.c Emitir Notificación de ganancia
                        await this.addNotification(
                            pred.user_id,
                            'SYSTEM',
                            '¡Predicción Ganada!',
                            `Has sumado ${finalPoints} puntos y ${creditedAmount} tokens en tu predicción del partido.`,
                            `/match/${matchId}`
                        );
                    }
                }

                // Marcar predicción como resuelta
                await supabase.from('predictions').update({
                    status: finalPoints > 0 ? 'WON' : (refundAmount > 0 ? 'WON' : 'LOST'), // Refund se considera "no pérdida"
                    points_won: finalPoints,
                    updated_at: new Date().toISOString()
                }).eq('id', pred.id);

                results.push({ userId: pred.user_id, points: finalPoints });
            }

            // 2.b Procesar PVP Challenges (solo los que el usuario logueado tiene acceso por RLS)
            const { data: challenges } = await supabase
                .from('pvp_challenges')
                .select('*')
                .eq('match_id', matchId)
                .in('status', ['PENDING', 'ACCEPTED']);

            if (challenges && challenges.length > 0) {
                for (const challenge of challenges) {
                    if (challenge.status === 'PENDING') {
                        // Refund creator
                        const { data: creatorProfile } = await supabase.from('profiles').select('total_balance').eq('id', challenge.creator_id).single();
                        if (creatorProfile) {
                            const newBalance = (creatorProfile.total_balance || 0) + challenge.amount;
                            await supabase.from('profiles').update({ total_balance: newBalance }).eq('id', challenge.creator_id);
                            
                            await supabase.from('transactions').insert({
                                user_id: challenge.creator_id,
                                type: 'BET_REFUND',
                                amount: challenge.amount,
                                description: `Reembolso PvP: Rival no aceptó`,
                                balance_after: newBalance,
                                balance_type: 'REDEEMABLE'
                            });
                        }
                        // Marcar como rechazado en lugar de borrar
                        await supabase.from('pvp_challenges').update({ status: 'REJECTED' }).eq('id', challenge.id);
                        
                        await this.addNotification(
                            challenge.creator_id,
                            'SYSTEM',
                            'Desafío No Aceptado',
                            `El partido ha finalizado y tu rival no aceptó a tiempo. Se te han devuelto ${challenge.amount} tokens.`,
                            `/profile?tab=ACTIVITY`
                        );
                    } else if (challenge.status === 'ACCEPTED') {
                        // Determine real outcome
                        let realOutcome: 'HOME' | 'DRAW' | 'AWAY';
                        if (homeScore > awayScore) realOutcome = 'HOME';
                        else if (awayScore > homeScore) realOutcome = 'AWAY';
                        else realOutcome = 'DRAW';

                        const creatorCorrect = challenge.creator_selection === realOutcome;
                        const winnerId = creatorCorrect ? challenge.creator_id : challenge.target_id;
                        const loserId = winnerId === challenge.creator_id ? challenge.target_id : challenge.creator_id;
                        const winnerName = winnerId === challenge.creator_id ? challenge.creator_name : challenge.target_name;
                        const loserName = winnerId === challenge.creator_id ? challenge.target_name : challenge.creator_name;

                        // Give prize to winner
                        const { data: winnerProfile } = await supabase.from('profiles').select('total_balance').eq('id', winnerId).single();
                        if (winnerProfile) {
                            const newBalance = (winnerProfile.total_balance || 0) + (challenge.amount * 2);
                            await supabase.from('profiles').update({ total_balance: newBalance }).eq('id', winnerId);
                            
                            await supabase.from('transactions').insert({
                                user_id: winnerId,
                                type: 'BET_WIN',
                                amount: challenge.amount * 2,
                                description: `¡Victoria en PvP contra ${loserName}!`,
                                balance_after: newBalance,
                                balance_type: 'REDEEMABLE'
                            });
                        }
                        await supabase.from('pvp_challenges').update({ status: 'FINISHED', winner_id: winnerId }).eq('id', challenge.id);

                        // Notify winner
                        await this.addNotification(
                            winnerId,
                            'CHALLENGE_FINISHED',
                            '¡Reto PvP Ganado!',
                            `Venciste a ${loserName} y te llevas el pozo de ${challenge.amount * 2} tokens.`,
                            `/profile?tab=ACTIVITY`
                        );
                        // Notify loser
                        await this.addNotification(
                            loserId,
                            'CHALLENGE_FINISHED',
                            'Reto PvP Perdido',
                            `${winnerName} acertó mejor el resultado. Perdiste ${challenge.amount} tokens.`,
                            `/profile?tab=PVP&view=SUMMARY`
                        );
                    }
                }
            }

            // 3. Actualizar estado del partido
            await supabase.from('matches').update({
                status: 'FINISHED',
                home_score: homeScore,
                away_score: awayScore,
                updated_at: new Date().toISOString()
            }).eq('id', matchId);

            return { success: true, processed: results.length, totalPoints: results.reduce((acc, r) => acc + r.points, 0) };
        } catch (error) {
            console.error('Error al resolver partido:', error);
            return { success: false, error };
        }
    },

    // --- NOTIFICATIONS SYSTEM ---
    addNotification: async (userId: string, type: string, title: string, message: string, path: string, metadata?: any) => {
        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type,
                title,
                message,
                path,
                metadata
            });
        return { success: !error, error };
    },

    // --- SOCIAL SYSTEM ---
    followUser: async (followerId: string, followedId: string) => {
        const { error } = await supabase
            .from('user_follows')
            .insert({ follower_id: followerId, followed_id: followedId });
        return { success: !error, error };
    },

    unfollowUser: async (followerId: string, followedId: string) => {
        const { error } = await supabase
            .from('user_follows')
            .delete()
            .eq('follower_id', followerId)
            .eq('followed_id', followedId);
        return { success: !error, error };
    },

    getFollowing: async (followerId: string) => {
        const { data, error } = await supabase
            .from('user_follows')
            .select('followed_id')
            .eq('follower_id', followerId);
        return { data: data?.map(d => d.followed_id) || [], error };
    },

    // --- ACTIVITY FEED SYSTEM ---
    recordActivity: async (userId: string, type: string, content: any, visibility: 'PUBLIC' | 'FOLLOWERS' = 'PUBLIC') => {
        const { error } = await supabase
            .from('user_activities')
            .insert({
                user_id: userId,
                type,
                content,
                visibility
            });
        return { success: !error, error };
    },

    fetchActivities: async (userId?: string, listType: 'GLOBAL' | 'FOLLOWING' = 'GLOBAL') => {
        let query = supabase
            .from('user_activities')
            .select('*, profiles(nickname, avatar_url, first_name)')
            .order('created_at', { ascending: false })
            .limit(10);

        if (listType === 'FOLLOWING' && userId) {
            const { data: following } = await supabase
                .from('user_follows')
                .select('followed_id')
                .eq('follower_id', userId);
            
            const followedIds = following?.map(f => f.followed_id) || [];
            if (followedIds.length > 0) {
                query = query.in('user_id', [userId, ...followedIds]);
            } else {
                query = query.eq('user_id', userId); // Solo ver propias si no sigue a nadie
            }
        }

        const { data, error } = await query;
        return { data, error };
    },

    // --- MATCH CHAT SYSTEM ---
    async addComment(matchId: string, userId: string, nickname: string, avatar: string, content: string) {
        const { data, error } = await supabase
            .from('match_comments')
            .insert({
                match_id: matchId,
                user_id: userId,
                user_nickname: nickname,
                user_avatar: avatar,
                content
            })
            .select()
            .single();
        return { success: !error, data, error };
    },

    async fetchComments(matchId: string) {
        const { data, error } = await supabase
            .from('match_comments')
            .select('*')
            .eq('match_id', matchId)
            .order('created_at', { ascending: true });
        return { data, error };
    },

    // --- EXPANSION: ORACLE & TOP PERFORMERS ---
    async isPredictionUnlocked(matchId: string, userId: string) {
        try {
            const { data, error } = await supabase
                .from('unlocked_ai_predictions')
                .select('id')
                .eq('match_id', matchId)
                .eq('user_id', userId)
                .maybeSingle();

            if (error) throw error;
            return { success: true, unlocked: !!data };
        } catch (error) {
            console.error('Error checking if prediction is unlocked:', error);
            return { success: false, unlocked: false, error };
        }
    },

    async unlockAiPrediction(matchId: string, userId: string, cost: number = 10) {
        try {
            const { data, error } = await supabase
                .rpc('unlock_ai_prediction', {
                    p_user_id: userId,
                    p_match_id: matchId,
                    p_cost: cost
                });

            if (error) throw error;
            return { success: !!data };
        } catch (error) {
            console.error('Error unlocking AI prediction:', error);
            return { success: false, error };
        }
    },

    async fetchTopPerformers(leagueId: string, season: number = 2026) {
        try {
            const { data, error } = await supabase
                .from('top_performers')
                .select('*')
                .eq('league_id', leagueId)
                .eq('season', season)
                .order('rank', { ascending: true });

            if (error) throw error;
            
            const scorers = data.filter(p => p.type === 'GOALS');
            const assists = data.filter(p => p.type === 'ASSISTS');
            
            return { success: true, scorers, assists };
        } catch (error) {
            console.error('Error fetching top performers:', error);
            return { success: false, error, scorers: [], assists: [] };
        }
    }
};
