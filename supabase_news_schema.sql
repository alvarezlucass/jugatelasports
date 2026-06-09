-- Script para crear la tabla de noticias
CREATE TABLE IF NOT EXISTS public.news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tag TEXT NOT NULL,
    headline TEXT NOT NULL,
    body TEXT,
    source_url TEXT,
    tweet_1 TEXT,
    tweet_2 TEXT,
    tweet_3 TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Políticas RLS (Row Level Security)
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer las noticias aprobadas
CREATE POLICY "Anyone can view approved news"
    ON public.news
    FOR SELECT
    USING (status = 'APPROVED');

-- Solo administradores pueden ver, insertar, o modificar todas las noticias (estado PENDING/REJECTED)
-- Nota: Asegúrate de que el rol ADMIN esté bien asignado en tu tabla `profiles`
CREATE POLICY "Admins can manage all news"
    ON public.news
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND (profiles.role = 'ADMIN' OR profiles.email = 'admin@jugatelasports.com')
        )
    );
