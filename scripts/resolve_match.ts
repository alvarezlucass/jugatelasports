import dotenv from 'dotenv';
dotenv.config();
import { databaseService } from '../src/services/databaseService';

const matchId = process.argv[2];
const homeScore = parseInt(process.argv[3], 10);
const awayScore = parseInt(process.argv[4], 10);

if (!matchId || isNaN(homeScore) || isNaN(awayScore)) {
    console.error('Uso: npx tsx resolve_match.ts <matchId> <homeScore> <awayScore>');
    process.exit(1);
}

async function run() {
    try {
        console.log(`[resolve_match] Ejecutando resolución para partido ${matchId} con resultado ${homeScore}-${awayScore}...`);
        await databaseService.resolveMatch(matchId, homeScore, awayScore);
        console.log(`[resolve_match] Resolución completada exitosamente para el partido ${matchId}.`);
        process.exit(0);
    } catch (e) {
        console.error(`[resolve_match] Error resolviendo partido ${matchId}:`, e);
        process.exit(1);
    }
}

run();
