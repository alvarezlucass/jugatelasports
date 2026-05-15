-- 1. AGREGAR COLUMNAS FALTANTES A PROFILES
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS dni text,
ADD COLUMN IF NOT EXISTS birth_date text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS nickname text,
ADD COLUMN IF NOT EXISTS nickname_is_public boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS level int DEFAULT 1,
ADD COLUMN IF NOT EXISTS points int DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak int DEFAULT 0;

-- 2. ACTUALIZAR TRIGGER PARA BONO DE 2000 TOKENS
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, 
    email, 
    full_name, 
    avatar_url, 
    total_balance, 
    locked_balance, 
    redeemable_balance,
    first_name,
    last_name,
    nickname
  )
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    2000,   -- AHORA 2000
    2000,   -- AHORA 2000
    0,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'nickname'
  );
  
  -- Registrar bono de bienvenida en transacciones
  insert into public.transactions (user_id, type, amount, description, balance_type, balance_after)
  values (new.id, 'DAILY_BONUS', 2000, 'Bono de Bienvenida', 'LOCKED', 2000);
  
  return new;
end;
$$ language plpgsql security definer;

-- 3. PERMISOS EXTRA PARA SINCRONIZACIÓN (Si no estaban)
-- Permitir que el anon key pueda hacer upsert en tablas de deportes (para los scripts)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can sync matches') THEN
        CREATE POLICY "Admin can sync matches" ON public.matches FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can sync teams') THEN
        CREATE POLICY "Admin can sync teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
