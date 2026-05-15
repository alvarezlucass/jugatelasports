-- MIGRACIÓN PARA DATOS PROFUNDOS DE CLUBES (PLANTELES, DT e HISTORIA)

-- 1. Tabla de Jugadores (Players)
CREATE TABLE IF NOT EXISTS public.players (
    id INTEGER PRIMARY KEY, -- ID de API-Football
    team_id INTEGER REFERENCES public.teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INTEGER,
    number INTEGER,
    position TEXT, -- 'Goalkeeper', 'Defender', 'Midfielder', 'Attacker'
    photo TEXT,
    price DECIMAL DEFAULT 500, -- Valor base en tokens para el futuro Mercado de Pases
    rarity TEXT DEFAULT 'COMMON', -- 'COMMON', 'RARE', 'EPIC', 'LEGENDARY'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Entrenadores (Coaches)
CREATE TABLE IF NOT EXISTS public.coaches (
    id INTEGER PRIMARY KEY, -- ID de API-Football
    team_id INTEGER REFERENCES public.teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INTEGER,
    photo TEXT,
    nationality TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Trofeos / Historia (Trophies)
CREATE TABLE IF NOT EXISTS public.trophies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id INTEGER REFERENCES public.teams(id) ON DELETE CASCADE,
    league TEXT NOT NULL,
    country TEXT,
    season TEXT,
    place TEXT, -- 'Winner', 'Runner-up'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dar permisos de lectura pública
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trophies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública jugadores" ON public.players FOR SELECT USING (true);
CREATE POLICY "Lectura pública entrenadores" ON public.coaches FOR SELECT USING (true);
CREATE POLICY "Lectura pública trofeos" ON public.trophies FOR SELECT USING (true);

-- Crear índices para búsquedas rápidas por equipo
CREATE INDEX IF NOT EXISTS idx_players_team_id ON public.players(team_id);
CREATE INDEX IF NOT EXISTS idx_coaches_team_id ON public.coaches(team_id);
CREATE INDEX IF NOT EXISTS idx_trophies_team_id ON public.trophies(team_id);
