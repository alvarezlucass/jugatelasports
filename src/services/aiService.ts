import { WORLD_CUP_TEAMS_HISTORY } from '../data/worldCupPersistence';
import type { Match, PredictionOutcome } from '../types';

export type AIType = 'bot-ia' | 'bot-contra' | 'bot-profe' | 'ai-loco';

interface AIPrediction {
    selection: PredictionOutcome;
    homeScore: number;
    awayScore: number;
}

export const aiService = {
    generatePrediction: (
        aiType: string,
        match: Match | null,
        userSelection?: PredictionOutcome,
        userHomeScore?: number,
        userAwayScore?: number
    ): AIPrediction => {
        switch (aiType) {
            case 'ai-ia':
                return getAnalystPrediction(match);
            case 'ai-profe':
                return getRankBasedPrediction(match);
            case 'ai-contra':
                return getContraPrediction(userSelection || 'DRAW');
            default:
                return getLocoPrediction();
        }
    }
};

/**
 * Lógica de LA IA: Analiza la racha de los últimos 5 partidos (Forma)
 * W: 3pts, D: 1pt, L: 0pts
 */
const getAnalystPrediction = (match: Match | null): AIPrediction => {
    if (!match) return getLocoPrediction();

    const homeData = WORLD_CUP_TEAMS_HISTORY[match.home_team];
    const awayData = WORLD_CUP_TEAMS_HISTORY[match.away_team];

    if (!homeData || !awayData) return getLocoPrediction();

    const calculateForm = (results: ('W' | 'D' | 'L')[]) => {
        return results.reduce((acc, curr) => acc + (curr === 'W' ? 3 : curr === 'D' ? 1 : 0), 0);
    };

    const homeForm = calculateForm(homeData.lastResults || []);
    const awayForm = calculateForm(awayData.lastResults || []);

    // El favorito es el que tiene mejor racha
    if (Math.abs(homeForm - awayForm) < 2) {
        return { selection: 'DRAW', homeScore: 1, awayScore: 1 };
    } else if (homeForm > awayForm) {
        const diff = homeForm - awayForm;
        return { selection: 'HOME', homeScore: diff > 5 ? 3 : 2, awayScore: 1 };
    } else {
        const diff = awayForm - homeForm;
        return { selection: 'AWAY', homeScore: 1, awayScore: diff > 5 ? 3 : 2 };
    }
};

/**
 * Lógica de EL PROFE: Basada estrictamente en el Ranking FIFA
 * Menor ranking = Mejor equipo
 */
const getRankBasedPrediction = (match: Match | null): AIPrediction => {
    if (!match) return getLocoPrediction();

    const homeRank = WORLD_CUP_TEAMS_HISTORY[match.home_team]?.fifaRanking || 100;
    const awayRank = WORLD_CUP_TEAMS_HISTORY[match.away_team]?.fifaRanking || 100;

    // Margen de sorpresa del 10% que mencionamos en el plan
    if (Math.random() < 0.1) {
        return getLocoPrediction();
    }

    if (Math.abs(homeRank - awayRank) < 5) {
        return { selection: 'DRAW', homeScore: 1, awayScore: 1 };
    } else if (homeRank < awayRank) {
        return { selection: 'HOME', homeScore: 2, awayScore: 0 };
    } else {
        return { selection: 'AWAY', homeScore: 0, awayScore: 2 };
    }
};

const getContraPrediction = (userSelection: PredictionOutcome): AIPrediction => {
    if (userSelection === 'HOME') {
        return { selection: 'AWAY', homeScore: 0, awayScore: 1 };
    } else if (userSelection === 'AWAY') {
        return { selection: 'HOME', homeScore: 1, awayScore: 0 };
    } else {
        // Si el usuario puso empate, el contra busca un ganador al azar para romperlo
        const isHome = Math.random() > 0.5;
        return isHome 
            ? { selection: 'HOME', homeScore: 2, awayScore: 1 } 
            : { selection: 'AWAY', homeScore: 1, awayScore: 2 };
    }
};

const getLocoPrediction = (): AIPrediction => {
    const rand = Math.random();
    if (rand < 0.33) {
        return { selection: 'HOME', homeScore: Math.floor(Math.random() * 3) + 1, awayScore: Math.floor(Math.random() * 2) };
    } else if (rand < 0.66) {
        return { selection: 'AWAY', homeScore: Math.floor(Math.random() * 2), awayScore: Math.floor(Math.random() * 3) + 1 };
    } else {
        const score = Math.floor(Math.random() * 2);
        return { selection: 'DRAW', homeScore: score, awayScore: score };
    }
};
