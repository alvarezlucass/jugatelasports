-- Script de Industrialización: Fase 2 (Ecosistema Social)
-- Ejecutar en el Editor SQL de Supabase

-- 1. Tabla de Actividades (Eventos Sociales)
CREATE TABLE IF NOT EXISTS public.user_activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('PREDICTION_MADE', 'MATCH_WON', 'LEVEL_UP', 'PVP_CHALLENGE', 'LOGIN_STREAK')),
  content jsonb NOT NULL, -- Datos específicos (ej: { match: 'Argentina vs Brasil', points: 50 })
  visibility text DEFAULT 'PUBLIC' CHECK (visibility IN ('PUBLIC', 'FOLLOWERS', 'PRIVATE')),
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS para Actividades
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Actividades públicas visibles para todos" 
ON public.user_activities FOR SELECT USING (visibility = 'PUBLIC');

CREATE POLICY "Actividades de seguidos visibles" 
ON public.user_activities FOR SELECT 
USING (
  visibility = 'FOLLOWERS' AND 
  EXISTS (
    SELECT 1 FROM public.user_follows 
    WHERE follower_id = auth.uid() AND followed_id = user_id
  )
);

CREATE POLICY "Usuarios pueden gestionar sus propias actividades" 
ON public.user_activities FOR ALL USING (auth.uid() = user_id);

-- 2. Indices para rendimiento del Feed
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.user_activities (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.user_activities (user_id);

-- 3. Tabla de Comentarios de Partidos (Chat)
CREATE TABLE IF NOT EXISTS public.match_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id text NOT NULL,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  user_nickname text,
  user_avatar text,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.match_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comentarios de partidos visibles para todos" ON public.match_comments FOR SELECT USING (true);
CREATE POLICY "Cualquiera puede comentar" ON public.match_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Registro histórico de puntos (para gráficos de tendencia)
-- Usaremos la tabla de transactions filtrando por 'BET_WIN' o 'POINTS_EARNED' 
-- pero para mayor comodidad creamos una vista o tabla de snapshots si fuera necesario.
-- Por ahora usaremos transactions.
