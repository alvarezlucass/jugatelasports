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

const storeItems = [
    // Especias
    {
        id: 'item-vino',
        name: 'Vino Tinto Reserva',
        description: 'Ideal para acompañar una victoria épica.',
        price: 50,
        icon: 'Wine',
        category: 'especias',
        color: 'from-red-600 to-red-900',
        badge: 'Popular'
    },
    {
        id: 'item-asado',
        name: 'Asado Criollo',
        description: 'La apuesta definitiva entre amigos.',
        price: 150,
        icon: 'Flame',
        category: 'especias',
        color: 'from-orange-600 to-red-600',
        badge: 'Premium'
    },
    {
        id: 'item-cerveza',
        name: 'Pack de Cervezas',
        description: 'Para refrescar la garganta tras el grito de gol.',
        price: 30,
        icon: 'Ice',
        category: 'especias',
        color: 'from-amber-400 to-amber-600'
    },
    // Boosters
    {
        id: 'booster-x2-global',
        name: 'Booster XP X2',
        description: 'Duplica los puntos de XP obtenidos en tu próxima jugada ganadora.',
        price: 100,
        icon: 'Zap',
        category: 'boosters',
        color: 'from-emerald-400 to-emerald-600',
        badge: 'Multip.'
    }
];

async function seedStore() {
    console.log('Starting store items seeding...');
    
    const { data, error } = await supabase
        .from('store_items')
        .upsert(storeItems);

    if (error) {
        console.error('Error seeding store items:', error);
        if (error.code === '42501') {
            console.log('RLS Policy denied. You might need the Service Role Key to seed data.');
        }
    } else {
        console.log('Successfully seeded store items:', storeItems.length);
    }
}

seedStore();
