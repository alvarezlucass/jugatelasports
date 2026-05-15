import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Match, Prediction, WalletTransaction } from '../types';
import { useUser } from '../contexts/UserContext'; // Asumimos que existirá o usaremos el contexto

export const useGames = () => {
    const { user, spendTokens } = useUser();
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [activePredictions, setActivePredictions] = useState<Prediction[]>([]);

    useEffect(() => {
        fetchMatches();
        if (user) fetchUserPredictions();
    }, [user]);

    const fetchMatches = async () => {
        try {
            const { data, error } = await supabase
                .from('matches')
                .select('*')
                .order('start_time', { ascending: true });

            if (error) throw error;

            if (data) {
                // Mapeo DB -> App Type
                const mappedMatches: Match[] = data.map(m => ({
                    id: m.id,
                    homeTeam: {
                        id: 'home', // Placeholder
                        name: m.home_team,
                        shortName: m.home_team.substring(0, 3).toUpperCase(),
                        logo: m.home_team_logo || '',
                        colors: ['#000000', '#ffffff'] // Placeholder
                    },
                    awayTeam: {
                        id: 'away', // Placeholder
                        name: m.away_team,
                        shortName: m.away_team.substring(0, 3).toUpperCase(),
                        logo: m.away_team_logo || '',
                        colors: ['#000000', '#ffffff'] // Placeholder
                    },
                    date: m.start_time,
                    status: m.status as any,
                    odds: m.odds || { home: 1.0, draw: 1.0, away: 1.0 },
                    score: {
                        home: m.home_score || 0,
                        away: m.away_score || 0
                    }
                }));
                setMatches(mappedMatches);
            }
        } catch (error) {
            console.error('Error fetching matches:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserPredictions = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('predictions')
            .select('*')
            .eq('user_id', user.id);

        if (data) {
            // Map predictions if necessary
            const mappedPreds: Prediction[] = data.map(p => ({
                id: p.id,
                userId: p.user_id,
                matchId: p.match_id,
                selection: p.selection as any,
                stake: p.stake,
                potentialReturn: p.potential_return,
                status: p.status as any,
                timestamp: p.created_at
            }));
            setActivePredictions(mappedPreds);
        }
    };

    const placeBet = async (matchId: string, selection: 'HOME' | 'DRAW' | 'AWAY', stake: number, odds: number) => {
        if (!user) return false;

        // 1. Validar saldo y gastar tokens (Contexto)
        const success = await spendTokens(stake, `Apuesta: ${selection} en Partido ${matchId}`);
        if (!success) {
            alert("No tienes suficientes tokens.");
            return false;
        }

        // 2. Crear predicción en DB
        const potentialReturn = stake * odds;

        const { error } = await supabase.from('predictions').insert({
            user_id: user.id,
            match_id: matchId,
            selection: selection,
            stake: stake,
            potential_return: potentialReturn,
            status: 'PENDING'
        });

        if (error) {
            console.error("Error placing bet:", error);
            // Idealmente: Reembolsar tokens si falla la DB (pero por ahora MVP)
            return false;
        }

        await fetchUserPredictions();
        return true;
    };

    return {
        matches,
        loading,
        activePredictions,
        placeBet,
        refresh: fetchMatches
    };
};
