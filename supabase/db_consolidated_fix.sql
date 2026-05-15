-- ############################################################################
-- MASTER FIX: INDUSTRIALIZACIÓN INTEGRAL DE LA BASE DE DATOS
-- Este script sincroniza el esquema de Supabase con el código del frontend 2026.
-- ############################################################################

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA PROFILES: Agregar columnas faltantes
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS nickname TEXT,
ADD COLUMN IF NOT EXISTS nickname_is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'USER',
ADD COLUMN IF NOT EXISTS points DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS dni TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE;

-- 3. TABLA PREDICTIONS: Agregar columnas para el Prode y Boosters
ALTER TABLE public.predictions 
ADD COLUMN IF NOT EXISTS home_score_pred INTEGER,
ADD COLUMN IF NOT EXISTS away_score_pred INTEGER,
ADD COLUMN IF NOT EXISTS points_won DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS booster_id TEXT,
ADD COLUMN IF NOT EXISTS advance_method TEXT DEFAULT 'REGULAR' CHECK (advance_method IN ('REGULAR', 'EXTRA', 'PENALTIES')),
ADD COLUMN IF NOT EXISTS opponent_type TEXT CHECK (opponent_type IN ('CPU', 'FRIEND', 'RANDOM', 'COMMUNITY')),
ADD COLUMN IF NOT EXISTS opponent_id UUID;

-- 4. TABLA STORE_ITEMS: Asegurar integridad
CREATE TABLE IF NOT EXISTS public.store_items (
    id TEXT PRIMARY KEY, -- Usamos TEXT para IDs manuales como 's1', 'b1'
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL NOT NULL CHECK (price >= 0),
    icon TEXT,
    category TEXT,
    color TEXT,
    badge TEXT,
    legal_terms TEXT,
    booster_effect JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Actualizar la restricción de categorías (incluyendo premios_fisicos)
ALTER TABLE public.store_items DROP CONSTRAINT IF EXISTS store_items_category_check;
ALTER TABLE public.store_items 
ADD CONSTRAINT store_items_category_check 
CHECK (category IN ('especias', 'boosters', 'cosmeticos', 'premios_fisicos'));

-- 5. TABLA USER_FOLLOWS: Sistema Social
CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    followed_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(follower_id, followed_id)
);

-- 6. TABLA USER_ACTIVITIES: Feed Global
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    content JSONB NOT NULL,
    visibility TEXT DEFAULT 'PUBLIC',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. TABLA PVP_CHALLENGES: Retos Directos
CREATE TABLE IF NOT EXISTS public.pvp_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    creator_name TEXT,
    creator_avatar TEXT,
    target_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    target_name TEXT,
    target_avatar TEXT,
    match_id TEXT,
    match_home_team TEXT,
    match_away_team TEXT,
    amount DECIMAL DEFAULT 0,
    item_reward TEXT,
    creator_selection TEXT,
    creator_home_score INTEGER,
    creator_away_score INTEGER,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'FINISHED')),
    winner_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. TABLA MATCH_COMMENTS: Chat de Partidos
CREATE TABLE IF NOT EXISTS public.match_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user_nickname TEXT,
    user_avatar TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. SEGURIDAD RLS (Row Level Security)
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pvp_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_comments ENABLE ROW LEVEL SECURITY;

-- Políticas simplificadas para agilidad (ajustar en producción real)
DROP POLICY IF EXISTS "Public View" ON public.user_follows;
CREATE POLICY "Public View" ON public.user_follows FOR SELECT USING (true);
DROP POLICY IF EXISTS "User Manage Follows" ON public.user_follows;
CREATE POLICY "User Manage Follows" ON public.user_follows FOR ALL USING (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Public Activities" ON public.user_activities;
CREATE POLICY "Public Activities" ON public.user_activities FOR SELECT USING (true);
DROP POLICY IF EXISTS "User Record Activity" ON public.user_activities;
CREATE POLICY "User Record Activity" ON public.user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "PVP View" ON public.pvp_challenges;
CREATE POLICY "PVP View" ON public.pvp_challenges FOR SELECT USING (auth.uid() = creator_id OR auth.uid() = target_id);
DROP POLICY IF EXISTS "PVP Create" ON public.pvp_challenges;
CREATE POLICY "PVP Create" ON public.pvp_challenges FOR INSERT WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Chat View" ON public.match_comments;
CREATE POLICY "Chat View" ON public.match_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Chat Post" ON public.match_comments;
CREATE POLICY "Chat Post" ON public.match_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. SETUP ADMIN: Asegurar rol y permisos
UPDATE public.profiles 
SET role = 'ADMIN' 
WHERE email = 'admin@jugatelasports.com';

-- Asegurar políticas de store_items para Admin
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Store View" ON public.store_items;
CREATE POLICY "Public Store View" ON public.store_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Store Manage" ON public.store_items;
CREATE POLICY "Admin Store Manage" ON public.store_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- ############################################################################
-- FIN DEL SCRIPT
-- ############################################################################
