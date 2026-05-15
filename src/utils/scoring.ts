export interface MatchScore {
    home: number;
    away: number;
}

export interface ScoringResult {
    points: number;
    description: string;
    isExact: boolean;
    isOutcome: boolean;
}

/**
 * Calculates points for a prediction based on the actual match result.
 * 
 * Rules:
 * - Exact Score: 3 Points (e.g. Predicted 2-1, Result 2-1)
 * - Correct Outcome (Winner/Draw): 1 Point (e.g. Predicted 2-1, Result 1-0)
 * - Incorrect: 0 Points
 */
export const calculatePoints = (
    prediction: MatchScore,
    actual: MatchScore,
    selectedResult?: 'HOME' | 'DRAW' | 'AWAY'
): ScoringResult => {
    const actualResult = actual.home > actual.away ? 'HOME' : actual.home < actual.away ? 'AWAY' : 'DRAW';

    // 1. Check Result (Winner/Draw)
    // If selectedResult is provided (Prode style), use it. 
    // Otherwise calculate from score prediction.
    const predResult = selectedResult ?? (prediction.home > prediction.away ? 'HOME' : prediction.home < prediction.away ? 'AWAY' : 'DRAW');

    const isOutcome = predResult === actualResult;
    const isExact = prediction.home === actual.home && prediction.away === actual.away;

    let points = 0;
    let description = 'Sin Premio';

    if (isOutcome && isExact) {
        points = 2; // 1pt result + 1pt score = 2 points (using 2x multiplier)
        description = '¡Resultado y Marcador Exacto! (x2)';
    } else if (isOutcome) {
        points = 1; // 1pt result = 1 point (using 1x multiplier? wait, 1x means no profit if stake=tokens)
        // Usually multipliers are > 1 for wins. 
        // If users WANT points, maybe we should return Actual Points and Multiplier separately.
        // Let's stick to the 1+1 structure but use multipliers that make sense for the game.
        // User said: "1 punto + 1 punto = 2 puntos".
        description = 'Resultado Acertado (1pt)';
    } else if (isExact) {
        // Theoretically possible to hit score but wrong result selection if not synced
        points = 1;
        description = 'Marcador Acertado (1pt)';
    }

    return {
        points,
        description,
        isExact,
        isOutcome
    };
};
