-- MIGRACIÓN FASE 4: EXPANSIÓN DE API (H2H, ORÁCULO DE IA, TOP PERFORMERS Y EN VIVO)

-- 0. Asegurar columnas de auditoría en tabla de transacciones (para compatibilidad de esquemas)
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS balance_type text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS balance_after decimal;

-- 1. Tabla para registrar los desbloqueos de predicciones de IA por usuario
CREATE TABLE IF NOT EXISTS public.unlocked_ai_predictions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    match_id text REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, match_id)
);

-- Habilitar RLS en unlocked_ai_predictions
ALTER TABLE public.unlocked_ai_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own unlocked predictions." 
ON public.unlocked_ai_predictions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own unlocked predictions." 
ON public.unlocked_ai_predictions FOR INSERT 
WITH CHECK (auth.uid() = user_id);


-- 2. Función SQL atómica para comprar/desbloquear el Oráculo con saldo total_balance (tokens)
CREATE OR REPLACE FUNCTION public.unlock_ai_prediction(p_user_id uuid, p_match_id text, p_cost decimal)
RETURNS boolean AS $$
DECLARE
    v_balance decimal;
    v_already_unlocked boolean;
BEGIN
    -- Verificar si ya está desbloqueado
    SELECT EXISTS(
        SELECT 1 FROM public.unlocked_ai_predictions 
        WHERE user_id = p_user_id AND match_id = p_match_id
    ) INTO v_already_unlocked;

    IF v_already_unlocked THEN
        RETURN true; -- Ya está desbloqueado, no cobrar
    END IF;

    -- Obtener saldo total actual del perfil
    SELECT total_balance INTO v_balance FROM public.profiles WHERE id = p_user_id;
    
    -- Validar saldo suficiente
    IF v_balance IS NULL OR v_balance < p_cost THEN
        RETURN false;
    END IF;
    
    -- Descontar saldo del perfil
    UPDATE public.profiles 
    SET total_balance = total_balance - p_cost
    WHERE id = p_user_id;
    
    -- Registrar la transacción correspondiente
    INSERT INTO public.transactions (user_id, type, amount, description, balance_type, balance_after)
    VALUES (p_user_id, 'BET_LOCKED', -p_cost, 'Desbloqueo de Oráculo IA (Partido ' || p_match_id || ')', 'LOCKED', v_balance - p_cost);
    
    -- Registrar el desbloqueo
    INSERT INTO public.unlocked_ai_predictions (user_id, match_id)
    VALUES (p_user_id, p_match_id);
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Tabla para almacenar máximos goleadores y asistentes de cada liga y temporada
CREATE TABLE IF NOT EXISTS public.top_performers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    league_id text NOT NULL,
    season int NOT NULL,
    type text NOT NULL CHECK (type IN ('GOALS', 'ASSISTS')),
    rank int NOT NULL,
    player_id text NOT NULL,
    player_name text NOT NULL,
    player_photo text,
    team_name text NOT NULL,
    team_logo text,
    value int NOT NULL, -- cantidad de goles o asistencias
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(league_id, season, type, player_id)
);

-- Habilitar RLS en top_performers
ALTER TABLE public.top_performers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Top performers viewable by everyone" 
ON public.top_performers FOR SELECT 
USING (true);

-- Agregar políticas de inserción para que nuestro script de sincronización pueda guardar los datos
-- En producción, se suele usar la clave de servicio (service_role) que salta RLS, pero habilitamos insert general para simplificar desarrollo
CREATE POLICY "Allow service role inserts on top_performers" 
ON public.top_performers FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow service role updates on top_performers" 
ON public.top_performers FOR UPDATE 
USING (true);

CREATE POLICY "Allow service role deletes on top_performers" 
ON public.top_performers FOR DELETE 
USING (true);

-- 4. Agregar columna group_name a la tabla standings para soportar copas con fase de grupos
ALTER TABLE public.standings ADD COLUMN IF NOT EXISTS group_name text;

