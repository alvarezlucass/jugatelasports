-- Add target prediction fields to pvp_challenges
ALTER TABLE pvp_challenges
ADD COLUMN target_selection text CHECK (target_selection IN ('HOME', 'DRAW', 'AWAY')),
ADD COLUMN target_home_score integer,
ADD COLUMN target_away_score integer;
