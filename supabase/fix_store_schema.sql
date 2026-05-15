-- FIX: ACTUALIZACIÓN DE CATEGORÍAS Y ROLES DE ADMINISTRACIÓN

-- 1. Actualizar la restricción de categorías en store_items
-- Primero eliminamos la restricción anterior si existe
DO $$ 
BEGIN 
    ALTER TABLE public.store_items DROP CONSTRAINT IF EXISTS store_items_category_check;
    
    -- Agregamos la nueva restricción que incluye premios_fisicos
    ALTER TABLE public.store_items 
    ADD CONSTRAINT store_items_category_check 
    CHECK (category IN ('especias', 'boosters', 'cosmeticos', 'premios_fisicos'));
END $$;

-- 2. Asegurar que el usuario administrador oficial tenga el rol ADMIN
-- Reemplazar con el email oficial si es distinto, pero basándonos en setup previo:
UPDATE public.profiles 
SET role = 'ADMIN' 
WHERE email = 'admin@jugatelasports.com';

-- 3. Habilitar RLS y asegurar políticas (reforzar lo existente)
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Solo admins pueden modificar tienda" ON public.store_items;
CREATE POLICY "Solo admins pueden modificar tienda" ON public.store_items
FOR ALL 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
);

-- 4. Verificar si la columna ID de store_items es compatible con TEXT o UUID
-- Si es UUID y estamos intentando insertar IDs como 's1', esto fallará.
-- En adelante usaremos UUIDs generados automáticamente por Supabase.
-- Aseguramos que el default esté presente:
ALTER TABLE public.store_items ALTER COLUMN id SET DEFAULT gen_random_uuid();
