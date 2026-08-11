-- 002: CHECK constraints
--
-- The schema had none: every invariant the app relies on was enforced only in
-- TypeScript, so anything reaching the database by another path (psql, a
-- script, a future endpoint) could violate it.
--
-- Idempotent: each ADD CONSTRAINT is skipped when a constraint of that name
-- already exists.
--
-- These constraints are added VALIDATED, so PostgreSQL checks every existing
-- row and the migration ABORTS if any row violates one. That is intentional —
-- match history is the point of this app, and a migration must never quietly
-- delete or rewrite it. If one aborts, run the matching SELECT under
-- "Pre-flight" below to see the offending rows and decide deliberately. Adding
-- the constraint NOT VALID (new rows only) is a reasonable escape hatch; note
-- it here if you use it.
--
-- Pre-flight — each should return zero rows:
--   SELECT * FROM matches WHERE player1_id = player2_id;
--   SELECT * FROM matches WHERE winner_id NOT IN (player1_id, player2_id);
--   SELECT * FROM matches WHERE loser_id NOT IN (player1_id, player2_id);
--   SELECT * FROM matches WHERE winner_id = loser_id;
--   SELECT * FROM matches WHERE player1_score < 0 OR player2_score < 0;
--   SELECT * FROM matches WHERE player1_score = player2_score;
--   SELECT * FROM matches WHERE GREATEST(player1_score, player2_score) < 11;
--   SELECT * FROM matches WHERE (winner_id = player1_id) <> (player1_score > player2_score);
--   SELECT * FROM players WHERE wins + losses <> matches_played;
--   SELECT * FROM players WHERE length(trim(name)) NOT BETWEEN 2 AND 50;

DO $$
BEGIN
    -- matches: the two sides are different people
    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'matches_distinct_players_check') THEN
        ALTER TABLE matches ADD CONSTRAINT matches_distinct_players_check
            CHECK (player1_id <> player2_id);
    END IF;

    -- matches: winner and loser are the two players, and are different
    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'matches_winner_is_participant_check') THEN
        ALTER TABLE matches ADD CONSTRAINT matches_winner_is_participant_check
            CHECK (winner_id IN (player1_id, player2_id));
    END IF;

    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'matches_loser_is_participant_check') THEN
        ALTER TABLE matches ADD CONSTRAINT matches_loser_is_participant_check
            CHECK (loser_id IN (player1_id, player2_id));
    END IF;

    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'matches_distinct_outcome_check') THEN
        ALTER TABLE matches ADD CONSTRAINT matches_distinct_outcome_check
            CHECK (winner_id <> loser_id);
    END IF;

    -- matches: scores are non-negative and not a draw
    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'matches_scores_non_negative_check') THEN
        ALTER TABLE matches ADD CONSTRAINT matches_scores_non_negative_check
            CHECK (player1_score >= 0 AND player2_score >= 0);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'matches_no_draw_check') THEN
        ALTER TABLE matches ADD CONSTRAINT matches_no_draw_check
            CHECK (player1_score <> player2_score);
    END IF;

    -- matches: the match-rule check, mirroring matchScoreSchema in
    -- src/lib/validation.ts. Note this encodes what the code actually accepts,
    -- which is looser than the comment there claims: past 11 it requires only a
    -- 2-point margin with the loser on 10+, so 20-10 passes. H7 owns resolving
    -- that contradiction; if it tightens the rule, tighten this to match.
    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'matches_valid_result_check') THEN
        ALTER TABLE matches ADD CONSTRAINT matches_valid_result_check
            CHECK (
                GREATEST(player1_score, player2_score) >= 11
                AND GREATEST(player1_score, player2_score) - LEAST(player1_score, player2_score) >= 2
                AND (
                    (GREATEST(player1_score, player2_score) = 11 AND LEAST(player1_score, player2_score) <= 9)
                    OR (GREATEST(player1_score, player2_score) > 11 AND LEAST(player1_score, player2_score) >= 10)
                )
            );
    END IF;

    -- matches: the winner is the one who scored more
    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'matches_winner_scored_more_check') THEN
        ALTER TABLE matches ADD CONSTRAINT matches_winner_scored_more_check
            CHECK ((winner_id = player1_id) = (player1_score > player2_score));
    END IF;

    -- players: counters are coherent
    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'players_counters_non_negative_check') THEN
        ALTER TABLE players ADD CONSTRAINT players_counters_non_negative_check
            CHECK (elo_rating >= 0 AND wins >= 0 AND losses >= 0 AND matches_played >= 0);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'players_matches_played_sum_check') THEN
        ALTER TABLE players ADD CONSTRAINT players_matches_played_sum_check
            CHECK (wins + losses = matches_played);
    END IF;

    -- players: mirrors playerNameSchema in src/lib/validation.ts
    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'players_name_length_check') THEN
        ALTER TABLE players ADD CONSTRAINT players_name_length_check
            CHECK (length(trim(name)) BETWEEN 2 AND 50);
    END IF;
END
$$;
