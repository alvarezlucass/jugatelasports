-- Ejecuta este script en el SQL Editor de Supabase para borrar todos los partidos simulados o auto-generados y sus dependencias
DELETE FROM public.pvp_challenges WHERE match_id LIKE 'sim-%' OR match_id IN (SELECT id FROM public.matches WHERE league_id = 'AUTO-GENERATED');
DELETE FROM public.predictions WHERE match_id LIKE 'sim-%' OR match_id IN (SELECT id FROM public.matches WHERE league_id = 'AUTO-GENERATED');
DELETE FROM public.match_comments WHERE match_id LIKE 'sim-%' OR match_id IN (SELECT id FROM public.matches WHERE league_id = 'AUTO-GENERATED');
DELETE FROM public.matches WHERE id LIKE 'sim-%' OR league_id = 'AUTO-GENERATED';
