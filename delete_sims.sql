-- Ejecuta este script en el SQL Editor de Supabase para borrar todos los partidos simulados y sus dependencias
DELETE FROM public.pvp_challenges WHERE match_id LIKE 'sim-%';
DELETE FROM public.predictions WHERE match_id LIKE 'sim-%';
DELETE FROM public.match_comments WHERE match_id LIKE 'sim-%';
DELETE FROM public.matches WHERE id LIKE 'sim-%';
