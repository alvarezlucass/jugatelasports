import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import type { PredictionOutcome } from '../types/index.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing Supabase credentials:');
  if (!supabaseUrl) console.error('- VITE_SUPABASE_URL is missing');
  if (!supabaseKey) console.error('- SUPABASE_SERVICE_ROLE_KEY is missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateBotActivity() {
  console.log('🤖 Iniciando simulación de actividad de bots...');

  // 1. Obtener partidos próximos (SCHEDULED)
  const { data: upcomingMatches, error: matchError } = await supabase
    .from('matches')
    .select('id, home_team, away_team, odds_home, odds_draw, odds_away')
    .eq('status', 'SCHEDULED');

  if (matchError || !upcomingMatches || upcomingMatches.length === 0) {
    console.log('No hay partidos programados (SCHEDULED) para simular actividad.');
    return;
  }

  // 2. Obtener bots
  const { data: bots, error: botError } = await supabase
    .from('profiles')
    .select('id, total_balance')
    .eq('is_bot', true);

  if (botError || !bots || bots.length === 0) {
    console.log('No se encontraron bots en la base de datos. Ejecuta generateBots.ts primero.');
    return;
  }

  // Cuántos bots apostarán en esta ejecución (ej. 20% de los bots)
  const numBotsToAct = Math.max(1, Math.floor(bots.length * 0.2));
  console.log(`Seleccionando ${numBotsToAct} bots al azar para predecir...`);

  // Mezclar y elegir bots
  const activeBots = bots.sort(() => 0.5 - Math.random()).slice(0, numBotsToAct);

  let predictionsInserted = 0;

  // 3. Generar predicciones
  for (const bot of activeBots) {
    // Elige un partido al azar para que apueste el bot
    const match = upcomingMatches[Math.floor(Math.random() * upcomingMatches.length)];
    
    // Simular lógica de apuestas basada en cuotas (odds) o aleatoria si no hay
    let selection: PredictionOutcome = 'DRAW';
    let homeScore = 1;
    let awayScore = 1;

    // Si tenemos cuotas (odds), usamos lógica ponderada (muy simplificada)
    // Si no, tiramos un dado
    const rand = Math.random();
    if (rand < 0.45) {
      selection = 'HOME';
      homeScore = Math.floor(Math.random() * 3) + 1; // 1, 2, 3
      awayScore = Math.floor(Math.random() * homeScore); // Menos que home
    } else if (rand < 0.75) {
      selection = 'AWAY';
      awayScore = Math.floor(Math.random() * 3) + 1; // 1, 2, 3
      homeScore = Math.floor(Math.random() * awayScore); // Menos que away
    } else {
      selection = 'DRAW';
      homeScore = Math.floor(Math.random() * 3); // 0, 1, 2
      awayScore = homeScore;
    }

    const stakeAmount = Math.floor(Math.random() * 50) + 10; // Apuesta entre 10 y 60 tokens

    // Comprobar si el bot ya predijo este partido
    const { data: existingPred } = await supabase
      .from('predictions')
      .select('id')
      .eq('user_id', bot.id)
      .eq('match_id', match.id)
      .single();

    if (!existingPred && bot.total_balance >= stakeAmount) {
      const { error: insertError } = await supabase.from('predictions').insert({
        user_id: bot.id,
        match_id: match.id,
        selection: selection,
        home_score_pred: homeScore,
        away_score_pred: awayScore,
        stake: stakeAmount,
        status: 'PENDING'
      });

      if (!insertError) {
        // Restar balance al bot
        await supabase
          .from('profiles')
          .update({ total_balance: bot.total_balance - stakeAmount })
          .eq('id', bot.id);
          
        predictionsInserted++;
      } else {
        console.error(`Error insertando predicción para bot ${bot.id}:`, insertError.message);
      }
    }
  }

  console.log(`✅ Simulación completada. Se generaron ${predictionsInserted} predicciones.`);
}

simulateBotActivity();
