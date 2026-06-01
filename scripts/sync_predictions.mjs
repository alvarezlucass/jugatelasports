import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const HEADERS = {
    'x-rapidapi-key': process.env.VITE_API_FOOTBALL_KEY,
    'x-rapidapi-host': 'v3.football.api-sports.io'
};

async function syncPredictions() {
    console.log('Fetching UPCOMING matches that do not have an ai_prediction yet...');
    
    // Obtenemos los partidos que aún no se jugaron
    const { data: matches, error } = await supabase
        .from('matches')
        .select('id, metadata')
        .in('status', ['UPCOMING']);

    if (error) {
        console.error('Error fetching matches:', error);
        return;
    }

    // Filtrar aquellos que NO tienen ai_prediction
    const matchesToPredict = matches.filter(m => !m.metadata?.ai_prediction);
    console.log(`Found ${matchesToPredict.length} matches without predictions.`);

    for (const match of matchesToPredict) {
        // En este mock, algunos fixtures id pueden no ser numéricos si fueron creados manualmente, 
        // pero la API de sports asume ID numéricos. Ignoramos si no se puede parsear.
        const fixtureId = parseInt(match.id, 10);
        if (isNaN(fixtureId)) {
            console.log(`Skipping mock/invalid match ID: ${match.id}`);
            continue;
        }

        console.log(`Fetching prediction for match ${match.id}...`);
        try {
            const res = await fetch(`https://v3.football.api-sports.io/predictions?fixture=${fixtureId}`, { headers: HEADERS });
            const data = await res.json();

            if (data.response && data.response.length > 0) {
                const pred = data.response[0];
                
                // Extraer lo que necesitamos para la UI
                const aiPrediction = {
                    advice: pred.predictions.advice,
                    percent: pred.predictions.percent,
                    comparison: pred.comparison
                };

                const newMetadata = {
                    ...match.metadata,
                    ai_prediction: aiPrediction
                };

                // Actualizar DB
                const { error: updateError } = await supabase
                    .from('matches')
                    .update({ metadata: newMetadata })
                    .eq('id', match.id);

                if (updateError) {
                    console.error(`Failed to update match ${match.id}:`, updateError);
                } else {
                    console.log(`Successfully saved prediction for match ${match.id}`);
                }
            } else {
                console.log(`No prediction data available from API for match ${match.id}`);
            }

            // Pause slightly to respect API rate limits
            await new Promise(r => setTimeout(r, 200));
        } catch (err) {
            console.error(`Error fetching prediction for match ${match.id}:`, err);
        }
    }

    console.log('Done syncing predictions.');
}

syncPredictions().catch(console.error);
