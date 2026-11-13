-- 004: tournaments
--
-- A tournament is a named period in which matches can be tagged as
-- tournament matches. The draw happens outside the app; a tournament match is
-- recorded exactly like any other (it counts for ELO), it just carries a
-- tournament_id. Idempotent: every statement is IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS tournaments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    ended_at timestamptz,

    -- Mirrors tournamentNameSchema in src/lib/validation.ts.
    CONSTRAINT tournaments_name_length_check
        CHECK (length(trim(name)) BETWEEN 2 AND 60),
    CONSTRAINT tournaments_ended_after_created_check
        CHECK (ended_at IS NULL OR ended_at >= created_at)
);

-- At most one tournament running at a time: a partial unique index over a
-- constant, so a second row with ended_at IS NULL is a unique violation.
CREATE UNIQUE INDEX IF NOT EXISTS tournaments_one_active_idx ON tournaments ((true)) WHERE ended_at IS NULL;

ALTER TABLE matches ADD COLUMN IF NOT EXISTS tournament_id uuid REFERENCES tournaments(id);

CREATE INDEX IF NOT EXISTS matches_tournament_id_idx ON matches (tournament_id);
