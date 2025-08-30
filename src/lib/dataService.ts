import type { Player, Match } from '../types/pong'
import { supabase } from './supabase'
import { transformPlayerFromDb, transformPlayerToDb, transformMatchFromDb, transformMatchToDb } from './transformers'
import { EloService } from './eloService'

export class DataService {
    /**
     * Fetch all players
     */
    static async getPlayers(): Promise<Player[]> {
        const { data, error } = await supabase.from('players').select('*').order('elo_rating', { ascending: false })

        if (error) {
            throw new Error(`Failed to fetch players: ${error.message}`)
        }

        return data.map(transformPlayerFromDb)
    }

    /**
     * Add a new player
     */
    static async addPlayer(playerData: Omit<Player, 'id'>): Promise<Player> {
        const dbPlayerData = transformPlayerToDb(playerData)

        const { data, error } = await supabase.from('players').insert([dbPlayerData]).select().single()

        if (error) {
            throw new Error(`Failed to add player: ${error.message}`)
        }

        return transformPlayerFromDb(data)
    }

    /**
     * Update a player
     */
    static async updatePlayer(id: string, updates: Partial<Omit<Player, 'id'>>): Promise<Player> {
        const updateData: Record<string, string | number | null> = {}
        if (updates.name) updateData.name = updates.name
        if (updates.avatar !== undefined) updateData.avatar = updates.avatar
        if (updates.eloRating !== undefined) updateData.elo_rating = updates.eloRating
        if (updates.matchesPlayed !== undefined) updateData.matches_played = updates.matchesPlayed
        if (updates.wins !== undefined) updateData.wins = updates.wins
        if (updates.losses !== undefined) updateData.losses = updates.losses
        if (updates.lastPlayedAt !== undefined) updateData.last_played_at = updates.lastPlayedAt

        const { data, error } = await supabase.from('players').update(updateData).eq('id', id).select().single()

        if (error) {
            throw new Error(`Failed to update player: ${error.message}`)
        }

        return transformPlayerFromDb(data)
    }

    /**
     * Fetch all matches
     */
    static async getMatches(): Promise<Match[]> {
        const { data, error } = await supabase.from('matches').select('*').order('played_at', { ascending: false })

        if (error) {
            throw new Error(`Failed to fetch matches: ${error.message}`)
        }

        return data.map(transformMatchFromDb)
    }

    /**
     * Add a new match
     */
    static async addMatch(matchData: Omit<Match, 'id'>): Promise<Match> {
        const dbMatchData = transformMatchToDb(matchData)

        const { data, error } = await supabase.from('matches').insert([dbMatchData]).select().single()

        if (error) {
            throw new Error(`Failed to add match: ${error.message}`)
        }

        return transformMatchFromDb(data)
    }

    /**
     * Add a new match and update player ratings in a transaction
     */
    static async addMatchWithPlayerUpdates(
        matchData: Omit<Match, 'id'>,
        winnerData: Player,
        loserData: Player
    ): Promise<Match> {
        // Calculate ELO changes
        const eloCalculation = EloService.calculateEloChanges(winnerData, loserData)
        
        // Update match data with calculated ELO changes
        const matchWithElo = {
            ...matchData,
            eloChanges: {
                [winnerData.id]: eloCalculation.winnerChange,
                [loserData.id]: eloCalculation.loserChange,
            },
        }

        // Calculate player updates
        const winnerUpdates = EloService.calculatePlayerUpdates(
            winnerData,
            true,
            eloCalculation.winnerNewRating
        )
        const loserUpdates = EloService.calculatePlayerUpdates(
            loserData,
            false,
            eloCalculation.loserNewRating
        )

        // Start transaction
        const { data: matchResult, error: matchError } = await supabase
            .from('matches')
            .insert([transformMatchToDb(matchWithElo)])
            .select()
            .single()

        if (matchError) {
            throw new Error(`Failed to add match: ${matchError.message}`)
        }

        // Update both players
        const { error: winnerUpdateError } = await supabase
            .from('players')
            .update(transformPlayerToDb({ ...winnerData, ...winnerUpdates }))
            .eq('id', winnerData.id)

        if (winnerUpdateError) {
            throw new Error(`Failed to update winner: ${winnerUpdateError.message}`)
        }

        const { error: loserUpdateError } = await supabase
            .from('players')
            .update(transformPlayerToDb({ ...loserData, ...loserUpdates }))
            .eq('id', loserData.id)

        if (loserUpdateError) {
            throw new Error(`Failed to update loser: ${loserUpdateError.message}`)
        }

        return transformMatchFromDb(matchResult)
    }
}
