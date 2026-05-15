-- SEED INDUSTRIAL: Bots, Usuarios y Grupos del Mundial 2026
-- Ejecuta esto en el SQL Editor de Supabase para poblar el sistema.

-- 1. Limpieza controlada (Opcional, comenta para mantener datos actuales)
-- DELETE FROM public.groups_members;
-- DELETE FROM public.groups;
-- DELETE FROM public.profiles WHERE id LIKE 'bot-%' OR username LIKE 'competidor_%';

-- 2. Creación de Bots Maestros
INSERT INTO public.profiles (id, username, full_name, avatar_url, total_balance, level)
VALUES 
  ('bot-ia', 'LaIA_Analista', 'IA Predictora v2.0', 'https://api.dicebear.com/7.x/bottts/svg?seed=LaIA&backgroundColor=b6e3f4', 2500, 15),
  ('bot-profe', 'ElProfe_FIFA', 'El Profe del Ranking', 'https://api.dicebear.com/7.x/bottts/svg?seed=Profe&backgroundColor=ffdfbf', 1800, 12),
  ('bot-contra', 'ElContra', 'El Contra-Apostador', 'https://api.dicebear.com/7.x/bottts/svg?seed=Contra&backgroundColor=ffd5dc', 1200, 8)
ON CONFLICT (id) DO UPDATE SET 
  total_balance = EXCLUDED.total_balance,
  avatar_url = EXCLUDED.avatar_url;

-- 3. Generación de 20 Usuarios Competitivos (Mock)
DO $$
BEGIN
   FOR i IN 1..20 LOOP
      INSERT INTO public.profiles (id, username, full_name, avatar_url, total_balance, level)
      VALUES (
         gen_random_uuid(), 
         'competidor_' || i, 
         'Héroe Mundialista ' || i, 
         'https://api.dicebear.com/7.x/avataaars/svg?seed=' || i, 
         floor(random() * 3000 + 500), 
         floor(random() * 10 + 1)
      );
   END LOOP;
END;
$$;

-- 4. Creación de Grupos Temáticos
INSERT INTO public.groups (id, name, description, color, owner_id)
VALUES 
  ('group-oficina', 'Oficina Mundialista 2026', 'Competencia interna de la empresa. ¡Solo para expertos!', 'blue', 'bot-ia'),
  ('group-expertos', 'Elite Prode Experts', 'Ranking global de los mejores apostadores.', 'gold', 'bot-profe'),
  ('group-amigos', 'Los Del Barrio', 'Grupo privado para asados y apuestas.', 'green', 'bot-contra')
ON CONFLICT (id) DO NOTHING;

-- 5. Inscripción Masiva (Mix de miembros en grupos)
-- Inscribir a los bots en los grupos
INSERT INTO public.groups_members (group_id, user_id, role)
VALUES 
  ('group-oficina', 'bot-ia', 'OWNER'),
  ('group-oficina', 'bot-profe', 'MEMBER'),
  ('group-expertos', 'bot-profe', 'OWNER'),
  ('group-expertos', 'bot-ia', 'MEMBER'),
  ('group-amigos', 'bot-contra', 'OWNER')
ON CONFLICT DO NOTHING;

-- Inscribir a algunos usuarios random en el grupo de Oficina para que no esté vacío
INSERT INTO public.groups_members (group_id, user_id, role)
SELECT 'group-oficina', id, 'MEMBER' 
FROM public.profiles 
WHERE username LIKE 'competidor_%' 
LIMIT 10
ON CONFLICT DO NOTHING;
