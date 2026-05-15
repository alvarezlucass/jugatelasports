import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { calculatePoints } from '../utils/pointsCalculator.js';
import type { PredictionOutcome } from '../types/index.js';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function simulateMatchClosure(matchId: string, homeScore: number, awayScore: number) {
  console.log(`🚀 Iniciando cierre de partido: ${matchId} (${homeScore} - ${awayScore})`);

  try {
    // 1. Actualizar el partido en la base de datos
    const { error: matchError } = await supabase
      .from('matches')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status: 'FINISHED',
        updated_at: new Date().toISOString()
      })
      .eq('id', matchId);

    if (matchError) throw matchError;
    console.log('✅ Partido actualizado a FINISHED.');

    // 2. Obtener todas las predicciones para este partido
    const { data: predictions, error: predError } = await supabase
      .from('predictions')
      .select('*')
      .eq('match_id', matchId)
      .eq('status', 'PENDING');

    if (predError) throw predError;
    console.log(`🔍 Encontradas ${predictions.length} predicciones pendientes.`);

    // Determinar resultado real
    let realOutcome: PredictionOutcome = 'DRAW';
    if (homeScore > awayScore) realOutcome = 'HOME';
    else if (awayScore > homeScore) realOutcome = 'AWAY';

    // 3. Procesar cada predicción
    for (const pred of predictions) {
      console.log(`\n👤 Procesando usuario ${pred.user_id}...`);
      
      const pointResult = calculatePoints(
        { home: pred.home_score_pred, away: pred.away_score_pred },
        { home: homeScore, away: awayScore },
        { isKnockout: pred.advance_method !== 'REGULAR' }
      );

      console.log(`📊 Resultado: ${pointResult.points} puntos (${pointResult.breakdown.isCorrectResult ? 'Acierto Resultado' : 'Fallo'})`);
      if (pointResult.breakdown.isExactScore) console.log('🎯 ¡MARCADOR EXACTO! (+2 pts)');

      // Determinar si ganó o perdió la apuesta 1X2 (si aplica)
      const wonBet = pred.selection === realOutcome;
      const status = wonBet || pointResult.points > 0 ? 'WON' : 'LOST';

      // Actualizar predicción
      const { error: updatePredError } = await supabase
        .from('predictions')
        .update({
          status,
          points_won: pointResult.points,
          updated_at: new Date().toISOString()
        })
        .eq('id', pred.id);

      if (updatePredError) console.error(`❌ Error actualizando predicción ${pred.id}:`, updatePredError);

      // Si ganó puntos, actualizar perfil del usuario
      if (pointResult.points > 0) {
        // En un sistema real esto debería ser atómico o vía RPC
        // Por ahora simulamos la suma
        const { data: profile } = await supabase
          .from('profiles')
          .select('total_balance')
          .eq('id', pred.user_id)
          .single();

        if (profile) {
          const newBalance = (profile.total_balance || 0) + pointResult.points;
          await supabase
            .from('profiles')
            .update({ total_balance: newBalance })
            .eq('id', pred.user_id);
          
          // Registrar transacción
          await supabase.from('transactions').insert({
            user_id: pred.user_id,
            type: 'BET_WIN',
            amount: pointResult.points,
            description: `Puntos Prode: ${matchId} (${homeScore}-${awayScore})`,
          });
        }
      }
    }

    console.log('\n✨ Simulación completada con éxito.');
  } catch (error) {
    console.error('❌ Error en la simulación:', error);
  }
}

// Obtener matchId de los argumentos de línea de comandos o usar uno por defecto
const matchId = process.argv[2] || 'm1';
const h = parseInt(process.argv[3]) || 2;
const a = parseInt(process.argv[4]) || 1;

simulateMatchClosure(matchId, h, a);
