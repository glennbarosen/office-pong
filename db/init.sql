-- Schema for a fresh install. Keep this in sync with db/migrations/: a database
-- created here and a database migrated from an older version must end up
-- identical.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE players (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    avatar text,
    elo_rating integer NOT NULL DEFAULT 1200,
    matches_played integer NOT NULL DEFAULT 0,
    wins integer NOT NULL DEFAULT 0,
    losses integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    last_played_at timestamptz,

    CONSTRAINT players_counters_non_negative_check
        CHECK (elo_rating >= 0 AND wins >= 0 AND losses >= 0 AND matches_played >= 0),
    CONSTRAINT players_matches_played_sum_check
        CHECK (wins + losses = matches_played),
    -- Mirrors playerNameSchema in src/lib/validation.ts.
    CONSTRAINT players_name_length_check
        CHECK (length(trim(name)) BETWEEN 2 AND 50)
);

CREATE TABLE matches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    player1_id uuid NOT NULL REFERENCES players(id),
    player2_id uuid NOT NULL REFERENCES players(id),
    winner_id uuid NOT NULL REFERENCES players(id),
    loser_id uuid NOT NULL REFERENCES players(id),
    player1_score integer NOT NULL,
    player2_score integer NOT NULL,
    played_at timestamptz NOT NULL DEFAULT now(),
    elo_changes jsonb NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT matches_distinct_players_check
        CHECK (player1_id <> player2_id),
    CONSTRAINT matches_winner_is_participant_check
        CHECK (winner_id IN (player1_id, player2_id)),
    CONSTRAINT matches_loser_is_participant_check
        CHECK (loser_id IN (player1_id, player2_id)),
    CONSTRAINT matches_distinct_outcome_check
        CHECK (winner_id <> loser_id),
    CONSTRAINT matches_scores_non_negative_check
        CHECK (player1_score >= 0 AND player2_score >= 0),
    CONSTRAINT matches_no_draw_check
        CHECK (player1_score <> player2_score),
    -- Mirrors matchScoreSchema in src/lib/validation.ts. Deuce (past 11) must
    -- win by exactly 2 — see db/migrations/003_tighten_deuce_margin.sql for
    -- why this used to be looser and what changed.
    CONSTRAINT matches_valid_result_check
        CHECK (
            GREATEST(player1_score, player2_score) >= 11
            AND (
                (GREATEST(player1_score, player2_score) = 11 AND LEAST(player1_score, player2_score) <= 9)
                OR (
                    GREATEST(player1_score, player2_score) > 11
                    AND LEAST(player1_score, player2_score) >= 10
                    AND GREATEST(player1_score, player2_score) - LEAST(player1_score, player2_score) = 2
                )
            )
        ),
    CONSTRAINT matches_winner_scored_more_check
        CHECK ((winner_id = player1_id) = (player1_score > player2_score))
);

CREATE INDEX matches_played_at_desc_idx ON matches (played_at DESC);
CREATE INDEX matches_player1_id_idx ON matches (player1_id);
CREATE INDEX matches_player2_id_idx ON matches (player2_id);
CREATE INDEX matches_winner_id_idx ON matches (winner_id);
CREATE INDEX matches_loser_id_idx ON matches (loser_id);
CREATE INDEX players_elo_rating_desc_idx ON players (elo_rating DESC);

-- Name uniqueness, case-insensitive. Previously enforced only in app code
-- against a client-side player list, so concurrent registrations could both win.
CREATE UNIQUE INDEX players_lower_name_key ON players (lower(name));
