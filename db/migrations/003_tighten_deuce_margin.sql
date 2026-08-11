-- 003: tighten the deuce win-by-2 rule to exactly +2
--
-- 002's matches_valid_result_check encoded the loose reading that
-- matchScoreSchema (src/lib/validation.ts) actually implemented at the time:
-- past 11 points, any margin of 2 or more was accepted, so 20-10 validated.
-- Its own comment said "must win by exactly 2" — the code and the comment
-- disagreed. Real table tennis deuce games end at precisely +2 (12-10, 13-11,
-- 14-12, ...), so this migration tightens both the application and the
-- database to that reading, decided deliberately rather than left ambiguous.
--
-- BEHAVIOR CHANGE: a score like 20-10, which the old constraint accepted, is
-- now rejected — both by the API (validation.ts, updated in the same change)
-- and by the database. If any match history was recorded with a deuce margin
-- greater than 2, this migration will ABORT rather than touch it, because the
-- constraint is added VALIDATED. Run the pre-flight query below first.
--
-- Idempotent: DROP ... IF EXISTS, then ADD.
--
-- Pre-flight — should return zero rows before running this migration:
--   SELECT * FROM matches
--   WHERE GREATEST(player1_score, player2_score) > 11
--     AND GREATEST(player1_score, player2_score) - LEAST(player1_score, player2_score) <> 2;
--
-- If that returns rows, this migration is not a mechanical apply — those are
-- real recorded matches, and someone needs to decide what happens to them
-- (leave the constraint loose, correct the rows, or exclude them) before
-- tightening. Checked locally 2026-08-11: zero rows on the dev database, but
-- that is seed data, not production history — re-run the query in every
-- database `pnpm db:migrate` is pointed at.

DO $$
BEGIN
    ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_valid_result_check;

    ALTER TABLE matches ADD CONSTRAINT matches_valid_result_check
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
        );
END
$$;
