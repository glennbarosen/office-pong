import { createClient } from '@supabase/supabase-js'
import { env } from '../utils/env'

// Database schema types that match our existing types
export type Database = {
    public: {
        Tables: {
            players: {
                Row: {
                    id: string
                    name: string
                    avatar: string | null
                    elo_rating: number
                    matches_played: number
                    wins: number
                    losses: number
                    created_at: string
                    last_played_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    avatar?: string | null
                    elo_rating?: number
                    matches_played?: number
                    wins?: number
                    losses?: number
                    created_at?: string
                    last_played_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    avatar?: string | null
                    elo_rating?: number
                    matches_played?: number
                    wins?: number
                    losses?: number
                    created_at?: string
                    last_played_at?: string | null
                }
                Relationships: []
            }
            matches: {
                Row: {
                    id: string
                    player1_id: string
                    player2_id: string
                    winner_id: string
                    loser_id: string
                    player1_score: number
                    player2_score: number
                    played_at: string
                    elo_changes: Record<string, number>
                }
                Insert: {
                    id?: string
                    player1_id: string
                    player2_id: string
                    winner_id: string
                    loser_id: string
                    player1_score: number
                    player2_score: number
                    played_at?: string
                    elo_changes: Record<string, number>
                }
                Update: {
                    id?: string
                    player1_id?: string
                    player2_id?: string
                    winner_id?: string
                    loser_id?: string
                    player1_score?: number
                    player2_score?: number
                    played_at?: string
                    elo_changes?: Record<string, number>
                }
                Relationships: [
                    {
                        foreignKeyName: 'matches_player1_id_fkey'
                        columns: ['player1_id']
                        isOneToOne: false
                        referencedRelation: 'players'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'matches_player2_id_fkey'
                        columns: ['player2_id']
                        isOneToOne: false
                        referencedRelation: 'players'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'matches_winner_id_fkey'
                        columns: ['winner_id']
                        isOneToOne: false
                        referencedRelation: 'players'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'matches_loser_id_fkey'
                        columns: ['loser_id']
                        isOneToOne: false
                        referencedRelation: 'players'
                        referencedColumns: ['id']
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

// Create Supabase client
export const supabase = createClient<Database>(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!)
