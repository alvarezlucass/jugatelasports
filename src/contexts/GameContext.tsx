import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Match, Prediction, PredictionOutcome } from '../types';
import { useUser } from './UserContext';
import { matchService } from '../services/matchService';

interface GameContextType {
    matches: any[]; // Changed to any[] temporarily to allow transition between Match/GroupMatch
    loading: boolean;
    predictions: Prediction[];
    placePrediction: (matchId: string, selection: PredictionOutcome, stake: number) => boolean;
    getMatch: (id: string) => any | undefined;
    refreshMatches: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const { spendTokens } = useUser();

    const fetchMatches = async () => {
        setLoading(true);
        try {
            const data = await matchService.getMatches();
            setMatches(data);
        } catch (error) {
            console.error('Error fetching matches in GameContext:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    const placePrediction = (matchId: string, selection: PredictionOutcome, stake: number) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return false;

        const homeTeamName = typeof match.homeTeam === 'string' ? match.homeTeam : match.homeTeam.name;
        const awayTeamName = typeof match.awayTeam === 'string' ? match.awayTeam : match.awayTeam.name;

        // Validate stake
        if (!spendTokens(stake, `Predicción ${homeTeamName} vs ${awayTeamName}`)) {
            return false;
        }

        // Note: For real industrial use, this should also call predictionService.savePrediction
        const newPrediction: Prediction = {
            id: crypto.randomUUID(),
            userId: 'user-1',
            matchId,
            selection,
            stake,
            potentialReturn: 0, // Calculated later or in DB
            status: 'ACTIVE',
            timestamp: new Date().toISOString(),
        };

        setPredictions(prev => [newPrediction, ...prev]);
        return true;
    };

    const getMatch = (id: string) => matches.find(m => m.id === id);

    return (
        <GameContext.Provider value={{
            matches,
            loading,
            predictions,
            placePrediction,
            getMatch,
            refreshMatches: fetchMatches
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error('useGame must be used within a GameProvider');
    return context;
};
