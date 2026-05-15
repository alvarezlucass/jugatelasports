-- CONFIGURACIÓN DE ROLES Y ADMINISTRADOR OFICIAL

-- 1. Agregar columna de rol a la tabla de perfiles
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'USER';

-- 2. Asegurarse de que pgcrypto está disponible para hashear la clave
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. Crear el usuario en auth.users (si no existe)
-- Nota: Generamos un UUID nuevo para el usuario
DO $$
DECLARE
    new_user_id UUID := gen_random_uuid();
    admin_email TEXT := 'admin@jugatelasports.com';
    admin_pass TEXT := '@Marte2026';
BEGIN
    -- Solo insertar si el email no está registrado
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
        INSERT INTO auth.users (
            id, 
            instance_id, 
            email, 
            encrypted_password, 
            email_confirmed_at, 
            raw_app_meta_data, 
            raw_user_meta_data, 
            created_at, 
            updated_at, 
            role, 
            confirmation_token, 
            email_change, 
            email_change_sent_at, 
            last_sign_in_at
        )
        VALUES (
            new_user_id,
            '00000000-0000-0000-0000-000000000000',
            admin_email,
            crypt(admin_pass, gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"Admin Jugatela","first_name":"Admin","last_name":"Sports"}',
            now(),
            now(),
            'authenticated',
            '',
            '',
            now(),
            now()
        );

        -- Crear el perfil correspondiente con rol ADMIN
        INSERT INTO public.profiles (id, email, first_name, last_name, nickname, role, total_balance, points, level)
        VALUES (new_user_id, admin_email, 'Admin', 'Sports', 'AdminJugatela', 'ADMIN', 1000000, 0, 99);
        
        RAISE NOTICE 'Usuario administrador creado con ID: %', new_user_id;
    ELSE
        -- Si el usuario ya existe, asegurar que tenga el rol ADMIN
        UPDATE public.profiles SET role = 'ADMIN' WHERE email = admin_email;
        RAISE NOTICE 'Rol de administrador actualizado para el usuario existente.';
    END IF;
END $$;

-- 4. Configurar RLS (Row Level Security) para store_items
ALTER TABLE store_items ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden ver los productos
DROP POLICY IF EXISTS "Permitir lectura publica de productos" ON store_items;
CREATE POLICY "Permitir lectura publica de productos" ON store_items
FOR SELECT USING (true);

-- Política: Solo administradores pueden modificar productos
DROP POLICY IF EXISTS "Solo admins pueden modificar tienda" ON store_items;
CREATE POLICY "Solo admins pueden modificar tienda" ON store_items
FOR ALL -- INSERT, UPDATE, DELETE
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'ADMIN'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'ADMIN'
    )
);

-- 5. Configurar RLS para user_activities (opcional, para proteger integridad)
-- Permitir que usuarios lean actvidades, pero solo el sistema/admin o el dueño registre
-- Ya está configurado por defecto usualmente, pero reforzamos si es necesario.
