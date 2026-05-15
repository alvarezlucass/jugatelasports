-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES: Información pública de usuarios y saldos
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  username text unique,
  full_name text,
  avatar_url text,
  
  -- Economía con auditoría
  total_balance decimal default 1000 check (total_balance >= 0),
  redeemable_balance decimal default 0 check (redeemable_balance >= 0),
  locked_balance decimal default 0 check (locked_balance >= 0),
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: Seguridad para perfiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- TRANSACTIONS: Historial inmutable de movimientos
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  type text not null check (type in ('DAILY_BONUS', 'DEPOSIT', 'BET_LOCKED', 'BET_WIN', 'BET_REFUND', 'REWARD_REDEEM')),
  amount decimal not null,
  description text,
  created_at timestamptz default now()
);

-- RLS: Transactions
alter table public.transactions enable row level security;

create policy "Users can view own transactions."
  on public.transactions for select
  using ( auth.uid() = user_id );

create policy "Users can insert own transactions."
  on public.transactions for insert
  with check ( auth.uid() = user_id );

-- MATCHES: Cache de partidos (para integridad referencial)
create table public.matches (
  id text primary key, -- ID de la API externa
  league_id text,
  season int,
  home_team text,
  home_team_logo text,
  away_team text,
  away_team_logo text,
  start_time timestamptz,
  status text, -- 'SCHEDULED', 'LIVE', 'FINISHED'
  home_score int,
  away_score int,
  odds jsonb, -- { home: 1.5, draw: 3.0, away: 2.5 }
  metadata jsonb,
  updated_at timestamptz default now()
);

alter table public.matches enable row level security;
create policy "Matches are viewable by everyone." on public.matches for select using (true);

-- PREDICTIONS: Jugadas de los usuarios (Apuestas 1X2 + Prode Exacto Mundial)
create table public.predictions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  match_id text references public.matches(id) not null,
  
  -- Modelo de Apuestas (Mantenemos por si se usa apuesta clásica 1X2 además del prode)
  selection text check (selection in ('HOME', 'DRAW', 'AWAY')),
  stake decimal not null check (stake > 0),
  potential_return decimal not null, -- Calculado al momento de la apuesta (stake * odds)
  
  -- Modelo Prode Mundial (Nuevos campos)
  home_score_pred int, -- Predicción exacta Goles Local
  away_score_pred int, -- Predicción exacta Goles Visitante
  opponent_type text check (opponent_type in ('CPU', 'FRIEND', 'RANDOM', 'COMMUNITY')),
  opponent_id uuid, -- Referencia a otro usuario si es duelo de amigos
  wager_item_id text, -- ID de la especia apostada (ej: 'item_fernet')
  advance_method text default 'REGULAR' check (advance_method in ('REGULAR', 'EXTRA', 'PENALTIES')),
  
  status text default 'PENDING' check (status in ('PENDING', 'WON', 'LOST', 'VOID')),
  points_won decimal default 0, -- Cantidad ganada (neta o bruta, definiremos lógica)
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.predictions enable row level security;

create policy "Users can view own predictions."
  on public.predictions for select
  using ( auth.uid() = user_id );

create policy "Users can create own predictions."
  on public.predictions for insert
  with check ( auth.uid() = user_id );

-- INVENTORY: Artículos y Especias de la Tienda
create table public.user_inventory (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  item_id text not null, -- Identificador de catálogo (ej 'item_asado')
  quantity int default 0 check (quantity >= 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, item_id)
);

alter table public.user_inventory enable row level security;

create policy "Users can view own inventory."
  on public.user_inventory for select
  using ( auth.uid() = user_id );

create policy "Users can update own inventory."
  on public.user_inventory for update
  using ( auth.uid() = user_id );

-- TRIGGER: Crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, total_balance, locked_balance, redeemable_balance)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 1000, 1000, 0);
  
  -- Registrar bono de bienvenida en transacciones
  insert into public.transactions (user_id, type, amount, description, balance_type, balance_after)
  values (new.id, 'DAILY_BONUS', 1000, 'Bono de Bienvenida', 'LOCKED', 1000);
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ECONOMÍA DUAL Y CAJA DE AHORRO (Ejecutar en Supabase SQL Editor)
-- 1. Agregar las nuevas columnas a transacciones
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS balance_type text check (balance_type in ('REDEEMABLE', 'LOCKED')),
ADD COLUMN IF NOT EXISTS balance_after decimal;

-- 2. Asegurarse de que los perfiles existentes pasen su balance_total a locked_balance de forma predeterminada
UPDATE public.profiles
SET locked_balance = total_balance
WHERE locked_balance = 0 AND total_balance > 0;

-- STORE_ITEMS: Catálogo de la Tienda Dinámica
create table public.store_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price decimal not null check (price >= 0),
  icon text,
  category text check (category in ('especias', 'boosters', 'cosmeticos')),
  color text,
  badge text,
  legal_terms text,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.store_items enable row level security;

-- Cualquier usuario logueado puede VER los items (para la tienda publica)
create policy "Store items viewable by everyone" on public.store_items for select using (true);

-- IMPORTANTE: Solo administradores deberían poder insertar/actualizar (por ahora habilitamos insert general, pero se debe bloquear con rules de RLS en el futuro)
create policy "Admin only inserts" on public.store_items for insert with check (true);
create policy "Admin only updates" on public.store_items for update using (true);
