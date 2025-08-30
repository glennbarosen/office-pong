import type { Player, Match } from '../types/pong'
import type { Database } from './supabase'

type DbPlayer = Database['public']['Tables']['players']['Row']
type DbPlayerInsert = Database['public']['Tables']['players']['Insert']
type DbMatch = Database['public']['Tables']['matches']['Row']
type DbMatchInsert = Database['public']['Tables']['matches']['Insert']

/**
 * Transform database player to application player type
 */
export function transformPlayerFromDb(dbPlayer: DbPlayer): Player {
    return {
        id: dbPlayer.id,
        name: dbPlayer.name,
        avatar: dbPlayer.avatar || undefined,
        eloRating: dbPlayer.elo_rating,
        matchesPlayed: dbPlayer.matches_played,
        wins: dbPlayer.wins,
        losses: dbPlayer.losses,
        createdAt: dbPlayer.created_at,
        lastPlayedAt: dbPlayer.last_played_at || undefined,
    }
}

/**
 * Transform application player to database insert type
 */
export function transformPlayerToDb(player: Omit<Player, 'id'>): DbPlayerInsert {
    return {
        name: player.name,
        avatar: player.avatar || null,
        elo_rating: player.eloRating,
        matches_played: player.matchesPlayed,
        wins: player.wins,
        losses: player.losses,
        created_at: player.createdAt,
        last_played_at: player.lastPlayedAt || null,
    }
}

/**
 * Transform database match to application match type
 */
export function transformMatchFromDb(dbMatch: DbMatch): Match {
    return {
        id: dbMatch.id,
        player1Id: dbMatch.player1_id,
        player2Id: dbMatch.player2_id,
        winnerId: dbMatch.winner_id,
        loserId: dbMatch.loser_id,
        player1Score: dbMatch.player1_score,
        player2Score: dbMatch.player2_score,
        playedAt: dbMatch.played_at,
        eloChanges: dbMatch.elo_changes,
    }
}

/**
 * Transform application match to database insert type
 */
export function transformMatchToDb(match: Omit<Match, 'id'>): DbMatchInsert {
    return {
        player1_id: match.player1Id,
        player2_id: match.player2Id,
        winner_id: match.winnerId,
        loser_id: match.loserId,
        player1_score: match.player1Score,
        player2_score: match.player2Score,
        played_at: match.playedAt,
        elo_changes: match.eloChanges,
    }
}
