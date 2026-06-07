-- Actualizar el estado de los partidos de la Copa Argentina de hoy a 'POSTPONED'
UPDATE public.matches
SET status = 'POSTPONED'
WHERE id IN ('1540060', '1540056', '1540103');
