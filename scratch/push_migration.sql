-- Crear la tabla para guardar las suscripciones de los dispositivos
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Para que no haya duplicados si el usuario vuelve a suscribir el mismo dispositivo
    UNIQUE(user_id, endpoint)
);

-- Políticas de Seguridad (RLS)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Un usuario solo puede ver y gestionar sus propias suscripciones
CREATE POLICY "Users can manage their own subscriptions"
ON push_subscriptions
FOR ALL
USING (auth.uid() = user_id);
