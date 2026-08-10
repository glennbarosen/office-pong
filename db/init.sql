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
    last_played_at timestamptz
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
    elo_changes jsonb NOT NULL DEFAULT '{}'::jsonb
);
