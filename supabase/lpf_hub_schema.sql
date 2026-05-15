-- MIGRACIÓN PARA HUB DE LIGAS Y LIGA PROFESIONAL ARGENTINA (LPF)

-- 1. Tabla de Ligas
CREATE TABLE IF NOT EXISTS public.leagues (
    id TEXT PRIMARY KEY, -- Ej: 'lpf', 'premier', 'world-cup-2026'
    api_id INTEGER UNIQUE, -- ID de API-Football (ej: 128)
    name TEXT NOT NULL,
    country TEXT,
    logo TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Equipos (Teams)
CREATE TABLE IF NOT EXISTS public.teams (
    id INTEGER PRIMARY KEY, -- ID de API-Football
    name TEXT NOT NULL,
    short_name TEXT,
    logo TEXT,
    founded INTEGER,
    stadium_name TEXT,
    colors JSONB DEFAULT '{"primary": "#FFFFFF", "secondary": "#000000"}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Relación Liga-Equipo (Para ligas multianuales/temporadas)
CREATE TABLE IF NOT EXISTS public.league_teams (
    league_id TEXT REFERENCES public.leagues(id),
    team_id INTEGER REFERENCES public.teams(id),
    season INTEGER,
    PRIMARY KEY (league_id, team_id, season)
);

-- 4. Tabla de Posiciones (Standings)
CREATE TABLE IF NOT EXISTS public.standings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    league_id TEXT REFERENCES public.leagues(id),
    season INTEGER,
    team_id INTEGER REFERENCES public.teams(id),
    rank INTEGER,
    points INTEGER,
    played INTEGER,
    win INTEGER,
    draw INTEGER,
    lose INTEGER,
    goals_for INTEGER,
    goals_against INTEGER,
    form TEXT, -- Ej: 'WWLDW'
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(league_id, season, team_id)
);

-- 5. Insertar Metadata inicial para LPF
INSERT INTO public.leagues (id, api_id, name, country, logo, metadata)
VALUES (
    'lpf', 
    128, 
    'Liga Profesional de Fútbol', 
    'Argentina', 
    'https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Liga_Profesional_de_F%C3%BAtbol_%28Argentina%29_logo.svg/800px-Liga_Profesional_de_F%C3%BAtbol_%28Argentina%29_logo.svg.png',
    '{"theme": {"primary": "#74ACDF", "secondary": "#FFFFFF"}}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Dar permisos de lectura pública
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública ligas" ON public.leagues FOR SELECT USING (true);
CREATE POLICY "Lectura pública equipos" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Lectura pública relación equipos" ON public.league_teams FOR SELECT USING (true);
CREATE POLICY "Lectura pública posiciones" ON public.standings FOR SELECT USING (true);
