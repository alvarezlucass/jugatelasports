-- FASE 3: ECONOMÍA ABIERTA Y MONETIZACIÓN

-- 1. Crear tabla de items de la tienda
CREATE TABLE IF NOT EXISTS store_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    icon TEXT, -- Nombre de icono Lucide o Emoji
    category TEXT CHECK (category IN ('especias', 'boosters', 'cosmeticos')),
    color TEXT,
    badge TEXT,
    booster_effect JSONB, -- Estructura: { "type": "MULTIPLIER" | "REFUND", "value": 2 | 0.5 }
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insertar catálogo inicial
INSERT INTO store_items (id, name, description, price, icon, category, color, badge, booster_effect)
VALUES 
    ('s1', 'Fernet con Coca', 'Para apostar en el clásico. Un básico infaltable.', 500, 'Wine', 'especias', 'purple', null, null),
    ('s2', 'Asado para 4', 'La apuesta de los valientes. Demuestra quién manda.', 2500, 'Flame', 'especias', 'red', null, null),
    ('s3', 'Cerveza Artesanal', 'Apuesta casual con los pibes.', 200, 'Beer', 'especias', 'amber', null, null),
    ('b1', 'Multiplicador X2', 'Duplica los puntos que ganes en tu próxima predicción.', 1000, 'Zap', 'boosters', 'blue', 'Popular', '{"type": "MULTIPLIER", "value": 2}'),
    ('b2', 'Escudo Protector', 'Si pierdes la predicción, te devuelve el 50% de los tokens apostados.', 800, 'Shield', 'boosters', 'green', null, '{"type": "REFUND", "value": 0.5}')
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    booster_effect = EXCLUDED.booster_effect;

-- 3. Actualizar tabla de predicciones para soportar boosters
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS booster_id TEXT REFERENCES store_items(id);
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS points_won INTEGER DEFAULT 0;

-- 4. Asegurar que user_inventory tenga timestamps correctos
ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Comentarios de ayuda para el desarrollador
COMMENT ON COLUMN store_items.booster_effect IS 'Efecto lógico que procesa el motor de puntos al resolver el partido.';
