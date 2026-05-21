-- ############################################################################
-- SCHEMA INITIALIZATION & CONSOLIDATED RLS POLICIES FOR SUPABASE
-- ############################################################################

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. CREATE TABLES (IF NOT EXISTS)
-- ==========================================

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    email text,
    username text UNIQUE,
    full_name text,
    avatar_url text,
    total_balance decimal DEFAULT 1000 CHECK (total_balance >= 0),
    redeemable_balance decimal DEFAULT 0 CHECK (redeemable_balance >= 0),
    locked_balance decimal DEFAULT 0 CHECK (locked_balance >= 0),
    first_name TEXT,
    last_name TEXT,
    nickname TEXT,
    nickname_is_public BOOLEAN DEFAULT false,
    role TEXT DEFAULT 'USER',
    points DECIMAL DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    dni TEXT,
    birth_date DATE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type text NOT NULL,
    amount decimal NOT NULL,
    description text,
    balance_type text CHECK (balance_type IN ('REDEEMABLE', 'LOCKED')),
    balance_after decimal,
    created_at timestamptz DEFAULT now()
);

-- LEAGUES
CREATE TABLE IF NOT EXISTS public.leagues (
    id TEXT PRIMARY KEY,
    api_id INTEGER UNIQUE,
    name TEXT NOT NULL,
    country TEXT,
    logo TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TEAMS
CREATE TABLE IF NOT EXISTS public.teams (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT,
    logo TEXT,
    founded INTEGER,
    stadium_name TEXT,
    colors JSONB DEFAULT '{"primary": "#FFFFFF", "secondary": "#000000"}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LEAGUE TEAMS
CREATE TABLE IF NOT EXISTS public.league_teams (
    league_id TEXT REFERENCES public.leagues(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES public.teams(id) ON DELETE CASCADE,
    season INTEGER,
    PRIMARY KEY (league_id, team_id, season)
);

-- STANDINGS
CREATE TABLE IF NOT EXISTS public.standings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    league_id TEXT REFERENCES public.leagues(id) ON DELETE CASCADE,
    season INTEGER,
    team_id INTEGER REFERENCES public.teams(id) ON DELETE CASCADE,
    rank INTEGER,
    points INTEGER,
    played INTEGER,
    win INTEGER,
    draw INTEGER,
    lose INTEGER,
    goals_for INTEGER,
    goals_against INTEGER,
    form TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(league_id, season, team_id)
);

-- MATCHES
CREATE TABLE IF NOT EXISTS public.matches (
    id text PRIMARY KEY,
    league_id text,
    season int,
    home_team text,
    home_team_logo text,
    away_team text,
    away_team_logo text,
    start_time timestamptz,
    status text,
    home_score int,
    away_score int,
    odds jsonb,
    metadata jsonb,
    updated_at timestamptz DEFAULT now()
);

-- PREDICTIONS
CREATE TABLE IF NOT EXISTS public.predictions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    match_id text REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
    selection text CHECK (selection IN ('HOME', 'DRAW', 'AWAY')),
    stake decimal NOT NULL DEFAULT 10 CHECK (stake > 0),
    potential_return decimal NOT NULL DEFAULT 0,
    home_score_pred INTEGER,
    away_score_pred INTEGER,
    points_won DECIMAL DEFAULT 0,
    booster_id TEXT,
    advance_method TEXT DEFAULT 'REGULAR' CHECK (advance_method IN ('REGULAR', 'EXTRA', 'PENALTIES')),
    opponent_type TEXT CHECK (opponent_type IN ('CPU', 'FRIEND', 'RANDOM', 'COMMUNITY')),
    opponent_id UUID,
    wager_item_id TEXT,
    status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'WON', 'LOST', 'VOID')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- USER INVENTORY
CREATE TABLE IF NOT EXISTS public.user_inventory (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    item_id text not null,
    quantity int DEFAULT 0 CHECK (quantity >= 0),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, item_id)
);

-- STORE ITEMS
CREATE TABLE IF NOT EXISTS public.store_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL NOT NULL CHECK (price >= 0),
    icon TEXT,
    category TEXT CHECK (category IN ('especias', 'boosters', 'cosmeticos', 'premios_fisicos')),
    color TEXT,
    badge TEXT,
    legal_terms TEXT,
    booster_effect JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- USER FOLLOWS
CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    followed_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(follower_id, followed_id)
);

-- USER ACTIVITIES
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    content JSONB NOT NULL,
    visibility TEXT DEFAULT 'PUBLIC',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- PVP CHALLENGES
CREATE TABLE IF NOT EXISTS public.pvp_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    creator_name TEXT,
    creator_avatar TEXT,
    target_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    target_name TEXT,
    target_avatar TEXT,
    match_id TEXT,
    match_home_team TEXT,
    match_away_team TEXT,
    amount DECIMAL DEFAULT 0,
    item_reward TEXT,
    creator_selection TEXT,
    creator_home_score INTEGER,
    creator_away_score INTEGER,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'FINISHED')),
    winner_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- MATCH COMMENTS
CREATE TABLE IF NOT EXISTS public.match_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user_nickname TEXT,
    user_avatar TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- PLAYERS
CREATE TABLE IF NOT EXISTS public.players (
    id INTEGER PRIMARY KEY,
    team_id INTEGER REFERENCES public.teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INTEGER,
    number INTEGER,
    position TEXT,
    photo TEXT,
    price DECIMAL DEFAULT 500,
    rarity TEXT DEFAULT 'COMMON',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- COACHES
CREATE TABLE IF NOT EXISTS public.coaches (
    id INTEGER PRIMARY KEY,
    team_id INTEGER REFERENCES public.teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INTEGER,
    photo TEXT,
    nationality TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TROPHIES
CREATE TABLE IF NOT EXISTS public.trophies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id INTEGER REFERENCES public.teams(id) ON DELETE CASCADE,
    league TEXT NOT NULL,
    country TEXT,
    season TEXT,
    place TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. HELPER FUNCTIONS
-- ==========================================

-- SECURITY DEFINER function to check admin role safely
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==========================================
-- 3. ENABLE RLS & CREATE POLICIES
-- ==========================================

-- LEAGUES
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública ligas" ON public.leagues;
CREATE POLICY "Lectura pública ligas" ON public.leagues FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin control total ligas" ON public.leagues;
CREATE POLICY "Admin control total ligas" ON public.leagues FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- TEAMS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública equipos" ON public.teams;
CREATE POLICY "Lectura pública equipos" ON public.teams FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin control total equipos" ON public.teams;
CREATE POLICY "Admin control total equipos" ON public.teams FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- LEAGUE TEAMS
ALTER TABLE public.league_teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública relación equipos" ON public.league_teams;
CREATE POLICY "Lectura pública relación equipos" ON public.league_teams FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin control total relación equipos" ON public.league_teams;
CREATE POLICY "Admin control total relación equipos" ON public.league_teams FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- STANDINGS
ALTER TABLE public.standings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública posiciones" ON public.standings;
CREATE POLICY "Lectura pública posiciones" ON public.standings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin control total posiciones" ON public.standings;
CREATE POLICY "Admin control total posiciones" ON public.standings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- MATCHES
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Matches are viewable by everyone." ON public.matches;
CREATE POLICY "Matches are viewable by everyone." ON public.matches FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin control total matches" ON public.matches;
CREATE POLICY "Admin control total matches" ON public.matches FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR public.is_admin()) WITH CHECK (auth.uid() = id OR public.is_admin());
DROP POLICY IF EXISTS "Admin control total profiles" ON public.profiles;
CREATE POLICY "Admin control total profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PREDICTIONS
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own predictions." ON public.predictions;
CREATE POLICY "Users can view own predictions." ON public.predictions FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = opponent_id OR public.is_admin());
DROP POLICY IF EXISTS "Users can create own predictions." ON public.predictions;
CREATE POLICY "Users can create own predictions." ON public.predictions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users can update own predictions." ON public.predictions;
CREATE POLICY "Users can update own predictions." ON public.predictions FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Admin control total predictions" ON public.predictions;
CREATE POLICY "Admin control total predictions" ON public.predictions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- TRANSACTIONS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own transactions." ON public.transactions;
CREATE POLICY "Users can view own transactions." ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users can insert own transactions." ON public.transactions;
CREATE POLICY "Users can insert own transactions." ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Admin control total transactions" ON public.transactions;
CREATE POLICY "Admin control total transactions" ON public.transactions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- USER INVENTORY
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own inventory." ON public.user_inventory;
CREATE POLICY "Users can view own inventory." ON public.user_inventory FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users can update own inventory." ON public.user_inventory;
CREATE POLICY "Users can update own inventory." ON public.user_inventory FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users can insert own inventory." ON public.user_inventory;
CREATE POLICY "Users can insert own inventory." ON public.user_inventory FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Admin control total user_inventory" ON public.user_inventory;
CREATE POLICY "Admin control total user_inventory" ON public.user_inventory FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- STORE ITEMS
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Store View" ON public.store_items;
CREATE POLICY "Public Store View" ON public.store_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Store Manage" ON public.store_items;
CREATE POLICY "Admin Store Manage" ON public.store_items FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- USER FOLLOWS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public View" ON public.user_follows;
CREATE POLICY "Public View" ON public.user_follows FOR SELECT USING (true);
DROP POLICY IF EXISTS "User Manage Follows" ON public.user_follows;
CREATE POLICY "User Manage Follows" ON public.user_follows FOR ALL TO authenticated USING (auth.uid() = follower_id OR public.is_admin()) WITH CHECK (auth.uid() = follower_id OR public.is_admin());

-- USER ACTIVITIES
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Activities" ON public.user_activities;
CREATE POLICY "Public Activities" ON public.user_activities FOR SELECT USING (true);
DROP POLICY IF EXISTS "User Record Activity" ON public.user_activities;
CREATE POLICY "User Record Activity" ON public.user_activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Admin control total activities" ON public.user_activities;
CREATE POLICY "Admin control total activities" ON public.user_activities FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PVP CHALLENGES
ALTER TABLE public.pvp_challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "PVP View" ON public.pvp_challenges;
CREATE POLICY "PVP View" ON public.pvp_challenges FOR SELECT TO authenticated USING (auth.uid() = creator_id OR auth.uid() = target_id OR public.is_admin());
DROP POLICY IF EXISTS "PVP Create" ON public.pvp_challenges;
CREATE POLICY "PVP Create" ON public.pvp_challenges FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id OR public.is_admin());
DROP POLICY IF EXISTS "PVP Update" ON public.pvp_challenges;
CREATE POLICY "PVP Update" ON public.pvp_challenges FOR UPDATE TO authenticated USING (auth.uid() = creator_id OR auth.uid() = target_id OR public.is_admin()) WITH CHECK (auth.uid() = creator_id OR auth.uid() = target_id OR public.is_admin());
DROP POLICY IF EXISTS "Admin control total pvp" ON public.pvp_challenges;
CREATE POLICY "Admin control total pvp" ON public.pvp_challenges FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- MATCH COMMENTS
ALTER TABLE public.match_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Chat View" ON public.match_comments;
CREATE POLICY "Chat View" ON public.match_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Chat Post" ON public.match_comments;
CREATE POLICY "Chat Post" ON public.match_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Chat Manage" ON public.match_comments;
CREATE POLICY "Chat Manage" ON public.match_comments FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- PLAYERS, COACHES, TROPHIES
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública jugadores" ON public.players;
CREATE POLICY "Lectura pública jugadores" ON public.players FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin control total jugadores" ON public.players;
CREATE POLICY "Admin control total jugadores" ON public.players FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública entrenadores" ON public.coaches;
CREATE POLICY "Lectura pública entrenadores" ON public.coaches FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin control total entrenadores" ON public.coaches;
CREATE POLICY "Admin control total entrenadores" ON public.coaches FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.trophies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública trofeos" ON public.trophies;
CREATE POLICY "Lectura pública trofeos" ON public.trophies FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin control total trofeos" ON public.trophies;
CREATE POLICY "Admin control total trofeos" ON public.trophies FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
