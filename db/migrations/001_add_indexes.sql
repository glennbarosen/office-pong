-- 001: indexes
--
-- Before this migration the only indexes were the two implicit primary keys.
-- Idempotent: every statement is IF NOT EXISTS, so re-running is a no-op.

-- getMatches() orders by played_at DESC on every call.
CREATE INDEX IF NOT EXISTS matches_played_at_desc_idx ON matches (played_at DESC);

-- Per-player match lookups (the profile page, head-to-head records).
CREATE INDEX IF NOT EXISTS matches_player1_id_idx ON matches (player1_id);
CREATE INDEX IF NOT EXISTS matches_player2_id_idx ON matches (player2_id);
CREATE INDEX IF NOT EXISTS matches_winner_id_idx ON matches (winner_id);
CREATE INDEX IF NOT EXISTS matches_loser_id_idx ON matches (loser_id);

-- getPlayers() orders by elo_rating DESC.
CREATE INDEX IF NOT EXISTS players_elo_rating_desc_idx ON players (elo_rating DESC);

-- Name uniqueness was enforced only in app code, against a client-side player
-- list, so two people registering the same new name concurrently both won.
--
-- This CREATE fails if duplicates already exist. That is deliberate: find them
-- with the query below and decide what to do, rather than having a migration
-- silently pick a winner.
--
--   SELECT lower(name), count(*) FROM players GROUP BY 1 HAVING count(*) > 1;
CREATE UNIQUE INDEX IF NOT EXISTS players_lower_name_key ON players (lower(name));
