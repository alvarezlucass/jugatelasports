import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { WORLD_CUP_GROUP_MATCHES } from '../src/data/worldCupPersistence';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_EMAIL = 'admin@jugatelasports.com';
const ADMIN_PASSWORD = '@Marte2026';

async function authenticateAsAdmin() {
    console.log('Authenticating as admin...');
    const { data, error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });
    if (error) {
        console.error('Failed to authenticate as admin:', error.message);
        process.exit(1);
    } else {
        console.log('Successfully authenticated as Admin.');
    }
}

async function seedMatches() {
    await authenticateAsAdmin();
    console.log('Starting match seeding...');
    
    const formattedMatches = WORLD_CUP_GROUP_MATCHES.map(m => ({
        id: m.id,
        league_id: 'world-cup-2026',
        season: 2026, // season is integer in public.matches
        home_team: m.homeTeam,
        away_team: m.awayTeam,
        start_time: `${m.date}T${m.time}:00Z`,
        status: m.status === 'scheduled' ? 'UPCOMING' : m.status.toUpperCase(),
        home_score: m.homeScore || null,
        away_score: m.awayScore || null,
        metadata: {
            group: m.group,
            stadium: m.stadium,
            city: m.city,
            h2h: m.h2h || [],
            ai_prediction: {
                prediction: Math.random() > 0.5 ? '1' : '2',
                confidence: Math.floor(Math.random() * 40 + 60), // 60-99
                analysis: 'La IA ha detectado una ventaja táctica significativa en el mediocampo basada en el rendimiento histórico de ambos equipos en torneos internacionales. Las métricas sugieren un partido de alta intensidad con probabilidades de goles tardíos.',
                comparison: {
                    form: { home: `${Math.floor(Math.random() * 30 + 60)}%`, away: `${Math.floor(Math.random() * 30 + 50)}%` },
                    att: { home: `${Math.floor(Math.random() * 40 + 50)}%`, away: `${Math.floor(Math.random() * 40 + 50)}%` },
                    def: { home: `${Math.floor(Math.random() * 40 + 50)}%`, away: `${Math.floor(Math.random() * 40 + 50)}%` }
                }
            }
        }
    }));

    const { data, error } = await supabase
        .from('matches')
        .upsert(formattedMatches);

    if (error) {
        console.error('Error seeding matches:', error);
    } else {
        console.log('Successfully seeded matches:', formattedMatches.length);
    }
}

seedMatches();

