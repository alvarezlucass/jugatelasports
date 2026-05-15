const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load env vars if possible, otherwise use values from context
// Since we are in the environment, we might need to find the keys
// For this script, we'll assume the environment has the keys or we'll mock the client if needed.
// But we want a REAL injection. I'll try to find the keys in the project.

const fs = require('fs');
const envPath = '.env';
let supabaseUrl = '';
let supabaseKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.*)/)[1];
    supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];
} catch (e) {
    console.error('Could not read .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const items = [
    {
        name: 'Fernet',
        description: 'Multiplica x2 las ganancias si aciertas el resultado exacto.',
        price: 200,
        icon: '🍷',
        category: 'especias',
        color: 'purple',
        badge: 'Popular',
        is_active: true
    },
    {
        name: 'Ají Malagueta',
        description: 'Permite ver la tendencia de predicción de otros usuarios.',
        price: 150,
        icon: '🌶️',
        category: 'especias',
        color: 'red',
        badge: 'Táctico',
        is_active: true
    },
    {
        name: 'Pack "La Tercera"',
        description: 'Otorga +1000 XP y un badge exclusivo de Campeón.',
        price: 500,
        icon: '⭐',
        category: 'boosters',
        color: 'amber',
        badge: 'Premium',
        is_active: true
    },
    {
        name: 'Multiplicador x2',
        description: 'Duplica los puntos obtenidos en la próxima jornada.',
        price: 300,
        icon: '⚡',
        category: 'boosters',
        color: 'blue',
        badge: 'Estratégico',
        is_active: true
    },
    {
        name: 'Borde de Oro',
        description: 'Efecto visual premium en tu avatar y rankings.',
        price: 1000,
        icon: '🎨',
        category: 'cosmeticos',
        color: 'amber',
        badge: 'Epic',
        is_active: true
    },
    {
        name: 'Tag Profe',
        description: 'Título exclusivo "El Profe" debajo de tu nombre.',
        price: 750,
        icon: '🏷️',
        category: 'cosmeticos',
        color: 'zinc',
        badge: 'Legend',
        is_active: true
    }
];

async function inject() {
    console.log('Consultando artículos existentes...');
    const { data: existingItems } = await supabase.from('store_items').select('name');
    const existingNames = new Set(existingItems?.map(i => i.name) || []);
    
    const itemsToInsert = items.filter(item => !existingNames.has(item.name));
    
    if (itemsToInsert.length === 0) {
        console.log('El catálogo ya está actualizado. No hay nada nuevo que inyectar.');
        return;
    }

    console.log(`Inyectando ${itemsToInsert.length} nuevos artículos...`);
    const { error } = await supabase.from('store_items').insert(itemsToInsert);
    
    if (error) {
        console.error('Error al inyectar datos:', error);
    } else {
        console.log('Nuevos artículos inyectados exitosamente.');
    }
}

inject();
