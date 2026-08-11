/**
 * Column lists for the queries in this directory, kept in one place so a
 * SELECT and its row mapper cannot drift apart. See ./mappers.ts for the
 * matching row types.
 *
 * Separate from the query modules so importing them never pulls in `pg`.
 */
export const PLAYER_COLUMNS = 'id, name, avatar, elo_rating, matches_played, wins, losses, created_at, last_played_at'

export const MATCH_COLUMNS =
    'id, player1_id, player2_id, winner_id, loser_id, player1_score, player2_score, played_at, elo_changes'
