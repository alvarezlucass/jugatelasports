-- Add new columns to profiles table
alter table public.profiles 
add column if not exists first_name text,
add column if not exists last_name text,
add column if not exists nickname text,
add column if not exists nickname_is_public boolean default false,
add column if not exists dni text unique,
add column if not exists birth_date date;

-- Update the handle_new_user function to populate these fields
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, first_name, last_name, nickname, nickname_is_public, dni, birth_date, avatar_url, total_balance)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name', 
    new.raw_user_meta_data->>'nickname', 
    (new.raw_user_meta_data->>'nickname_is_public')::boolean,
    new.raw_user_meta_data->>'dni',
    (new.raw_user_meta_data->>'birth_date')::date,
    new.raw_user_meta_data->>'avatar_url', 
    1000
  );
  
  -- Registrar bono de bienvenida en transacciones
  insert into public.transactions (user_id, type, amount, description)
  values (new.id, 'DAILY_BONUS', 100, 'Bono de Bienvenida');
  
  return new;
end;
$$ language plpgsql security definer;
