-- Agregar columnas necesarias para el perfil completo de usuarios Google OAuth
-- Ejecutar en Supabase SQL Editor

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS dni text,
ADD COLUMN IF NOT EXISTS birth_date date,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS nickname text,
ADD COLUMN IF NOT EXISTS nickname_is_public boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS role text DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER'));

-- Opcional: Crear un índice único en dni para prevenir duplicados
-- (solo si no existe ya)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_dni_key ON public.profiles(dni) WHERE dni IS NOT NULL;

-- Confirmar columnas añadidas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;
