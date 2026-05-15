-- Script de Actualización para Industrialización (Fase 1)
-- Ejecutar en el Editor SQL de Supabase

-- 1. Agregar métricas de juego a Profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS points decimal DEFAULT 0,
ADD COLUMN IF NOT EXISTS level int DEFAULT 1,
ADD COLUMN IF NOT EXISTS streak int DEFAULT 0,
ADD COLUMN IF NOT EXISTS won_count int DEFAULT 0,
ADD COLUMN IF NOT EXISTS lost_count int DEFAULT 0;

-- 2. Asegurar que las predicciones tengan el campo de puntos ganados
ALTER TABLE public.predictions 
ADD COLUMN IF NOT EXISTS points_won decimal DEFAULT 0;

-- 3. Tabla de Seguidos (Social) si no existe
CREATE TABLE IF NOT EXISTS public.user_follows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid REFERENCES public.profiles(id) NOT NULL,
  followed_id uuid REFERENCES public.profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, followed_id)
);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cualquiera puede ver seguidores" ON public.user_follows FOR SELECT USING (true);
CREATE POLICY "Usuarios pueden seguir/dejar de seguir" ON public.user_follows FOR ALL USING (auth.uid() = follower_id);

-- 4. Tabla de Retos PvP (Asegurar campos industriales)
ALTER TABLE public.pvp_challenges
ADD COLUMN IF NOT EXISTS match_home_team text,
ADD COLUMN IF NOT EXISTS match_away_team text,
ADD COLUMN IF NOT EXISTS creator_name text,
ADD COLUMN IF NOT EXISTS target_name text;
