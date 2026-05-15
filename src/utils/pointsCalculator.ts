import type { PredictionOutcome } from '../types';

export type MatchDefinition = 'REGULAR' | 'EXTRA_TIME' | 'PENALTIES';

export interface Score {
    home: number;
    away: number;
}

export interface PointResult {
    points: number;
    total: number; // Alias for compatibility
    description: string;
    isExact: boolean;
    isOutcome: boolean;
    breakdown: {
        winner: number;      // +3
        exactScore: number;  // +2
        definition: number;  // +1 (Solo para eliminatorias)
    };
}

/**
 * Calcula los puntos obtenidos en base a la predicción y el resultado real.
 * Reglas industriales Mundial 2026:
 * 1. Acierto Ganador/Empate: +3 pts
 * 2. Pleno (Marcador Exacto): +2 pts adicionales
 * 3. Definición (90', 120', PKs): +1 pt extra (Solo en eliminatorias)
 * Máximo posible: 6 puntos.
 */
export const calculatePoints = (
    prediction: { score: Score; outcome?: PredictionOutcome; definition?: MatchDefinition },
    actual: { score: Score; definition: MatchDefinition },
    isKnockout: boolean = false
): PointResult => {
    let winnerPoints = 0;
    let exactPoints = 0;
    let definitionPoints = 0;

    // 1. Determinar ganadores
    const actualOutcome = getOutcome(actual.score);
    const predOutcome = prediction.outcome || getOutcome(prediction.score);

    const isOutcome = predOutcome === actualOutcome;
    if (isOutcome) {
        winnerPoints = 3;
    }

    // 2. Determinar marcador exacto
    const isExact = prediction.score.home === actual.score.home && prediction.score.away === actual.score.away;
    if (isExact) {
        exactPoints = 2;
    }

    // 3. Determinar punto de definición (Solo si es fase eliminatoria)
    if (isKnockout && prediction.definition === actual.definition) {
        definitionPoints = 1;
    }

    const total = winnerPoints + exactPoints + definitionPoints;
    
    // Generar descripción profesional
    let description = 'Sin Aciertos';
    if (total === 6) description = '¡PLENO TOTAL! (6 pts)';
    else if (total === 5) description = '¡Marcador Exacto! (5 pts)';
    else if (total === 4) description = 'Ganador + Definición (4 pts)';
    else if (total === 3) description = 'Ganador Acertado (3 pts)';
    else if (total === 1) description = 'Presage de Definición (1 pt)';

    return {
        points: total,
        total: total,
        description,
        isExact,
        isOutcome,
        breakdown: {
            winner: winnerPoints,
            exactScore: exactPoints,
            definition: definitionPoints
        }
    };
};

const getOutcome = (score: Score): PredictionOutcome => {
    if (score.home > score.away) return 'HOME';
    if (score.away > score.home) return 'AWAY';
    return 'DRAW';
};

