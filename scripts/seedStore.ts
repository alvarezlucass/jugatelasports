import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

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

const storeItems = [
    // Especias
    {
        id: '20b3cb1c-8a1a-4d22-b5e1-88fbf0a248f2',
        name: 'Vino Tinto Reserva',
        description: 'Ideal para acompañar una victoria épica.',
        price: 50,
        icon: 'Wine',
        category: 'especias',
        color: 'from-red-600 to-red-900',
        badge: 'Popular',
        is_active: true
    },
    {
        id: '33e19864-cb46-4cb7-a720-33792fe41b3d',
        name: 'Asado Criollo',
        description: 'La apuesta definitiva entre amigos.',
        price: 150,
        icon: 'Flame',
        category: 'especias',
        color: 'from-orange-600 to-red-600',
        badge: 'Premium',
        is_active: true
    },
    {
        id: '9920364d-df7e-4b68-b714-c8c3683f707f',
        name: 'Pack de Cervezas',
        description: 'Para refrescar la garganta tras el grito de gol.',
        price: 30,
        icon: 'Ice',
        category: 'especias',
        color: 'from-amber-400 to-amber-600',
        is_active: true
    },
    // Boosters
    {
        id: '01cf906c-847e-4c07-88ee-bd59dc81e8eb',
        name: 'Booster XP X2',
        description: 'Duplica los puntos de XP obtenidos en tu próxima jugada ganadora.',
        price: 100,
        icon: 'Zap',
        category: 'boosters',
        color: 'from-emerald-400 to-emerald-600',
        badge: 'Multip.',
        is_active: true
    }
];

async function seedStore() {
    await authenticateAsAdmin();
    
    console.log('Starting store items seeding...');
    
    const { data, error } = await supabase
        .from('store_items')
        .upsert(storeItems);

    if (error) {
        console.error('Error seeding store items:', error);
    } else {
        console.log('Successfully seeded store items:', storeItems.length);
    }
}

seedStore();

