-- TABLA DE SEGUIDORES (SOCIAL SYSTEM)
-- Permite que los usuarios sigan a otros competidores para filtrar rankings y retos.

CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    followed_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(follower_id, followed_id)
);

-- Habilitar RLS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad
CREATE POLICY "Users can view all follow relationships" 
    ON public.user_follows FOR SELECT USING (true);

CREATE POLICY "Users can follow others" 
    ON public.user_follows FOR INSERT 
    WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" 
    ON public.user_follows FOR DELETE 
    USING (auth.uid() = follower_id);

-- Comentario informativo
COMMENT ON TABLE public.user_follows IS 'Registra las relaciones de seguimiento entre usuarios para el feed social y rankings de amigos.';
