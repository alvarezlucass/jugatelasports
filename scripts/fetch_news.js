import { GoogleGenAI } from '@google/genai';
import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars from the root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
// IMPORTANTE: Para insertar en la base de datos desde un script backend, 
// necesitas la SERVICE_ROLE_KEY de Supabase, no la ANON_KEY.
// Asegúrate de agregar SUPABASE_SERVICE_ROLE_KEY a tu archivo .env
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY; 

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Faltan credenciales de Supabase en el .env");
    process.exit(1);
}

if (!GEMINI_API_KEY) {
    console.error("Falta GEMINI_API_KEY en el .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const parser = new Parser();

// RSS Feeds deportivos de prueba (puedes agregar más)
const FEEDS = [
    'https://www.espn.com.ar/espn/rss/news', // ESPN (Ejemplo genérico)
    'https://www.ole.com.ar/rss/futbol-internacional/', // Olé Fútbol Internacional
    'https://e00-marca.uecdn.es/rss/futbol/mundial.xml' // Marca Mundial
];

async function fetchNews() {
    console.log("Iniciando recolección de noticias...");
    const allItems = [];

    for (const url of FEEDS) {
        try {
            console.log(`Leyendo RSS: ${url}`);
            const feed = await parser.parseURL(url);
            // Tomamos los 2 últimos artículos de cada feed
            allItems.push(...feed.items.slice(0, 2));
        } catch (error) {
            console.error(`Error leyendo feed ${url}:`, error.message);
        }
    }

    console.log(`Se encontraron ${allItems.length} artículos recientes.`);
    
    for (const item of allItems) {
        try {
            console.log(`Procesando con IA: ${item.title}`);
            const payload = await processWithAI(item.title, item.link, item.contentSnippet);
            
            if (payload) {
                // Guardar en Supabase pending_news
                const { error } = await supabase.from('news').insert({
                    tag: payload.tag,
                    headline: payload.headline,
                    source_url: payload.sourceUrl,
                    tweet_1: payload.tweet_1,
                    tweet_2: payload.tweet_2,
                    tweet_3: payload.tweet_3,
                    status: 'PENDING'
                });

                if (error) {
                    console.error("Error al insertar en Supabase:", error.message);
                } else {
                    console.log(`✅ Noticia guardada: ${payload.headline}`);
                }
            }
        } catch (error) {
            console.error(`Error procesando noticia:`, error.message);
        }
    }

    console.log("Proceso terminado.");
    // Aquí puedes disparar un email (por ejemplo usando Resend, SendGrid) o webhook
    console.log("Para enviar un email, puedes usar el paquete 'nodemailer' o 'resend' aquí.");
}

async function processWithAI(title, url, snippet) {
    if (!GEMINI_API_KEY) {
        console.warn("⚠️ No se encontró GEMINI_API_KEY en .env. Insertando noticia cruda sin IA.");
        return {
            tag: "NOTICIA",
            headline: title.slice(0, 80),
            sourceUrl: url,
            tweet_1: "Acaba de salir esta noticia: " + title,
            tweet_2: "A debatir en Jugatela Sports...",
            tweet_3: "Leé más y predecí los partidos en jugatelasports.com"
        };
    }

    try {
        const prompt = `
Eres el redactor jefe de prensa y redes sociales para la plataforma "Jugatela Sports" (un sitio web free-to-play de predicciones deportivas).
Tu tono es directo, picante, futbolero y agresivo de la "vieja escuela" de Twitter.
Aquí está la noticia cruda:
Título: ${title}
Resumen: ${snippet}
URL: ${url}

Devuelve ÚNICAMENTE un JSON válido con la siguiente estructura y sin markdown:
{
  "tag": "Una etiqueta corta en mayúsculas como 'ÚLTIMO MOMENTO', 'INFO SELECCIÓN'",
  "headline": "Un resumen limpio de máximo 80 caracteres en español",
  "sourceUrl": "${url}",
  "tweet_1": "Post de X (Máx 240 caracteres) comparando la noticia de manera graciosa obligando al hincha a tomar partido.",
  "tweet_2": "Post de X (Máx 240 caracteres) simulando picardía en la web de Jugatela entre usuarios como 'pocket' o 'El Profe'.",
  "tweet_3": "Post de X (Máx 240 caracteres). El llamado a la acción. Desafía al lector a registrarse y reclamar sus tokens gratis: jugatelasports.com"
}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        let rawText = response.text;
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(rawText);
    } catch (error) {
        console.error("Error al conectar con Gemini:", error.message);
        return null;
    }
}

fetchNews();
