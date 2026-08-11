import type { Player, Match } from '../../types/pong'

// OpponentStats, EloHistoryPoint and ChartColors used to live here. They are
// shared domain/presentation types now, so they live in src/types/ — see
// AGENTS.md. Only this component's own props remain.
export interface PlayerMetricsProps {
    player: Player
    matches: Match[]
    players: Player[]
}
