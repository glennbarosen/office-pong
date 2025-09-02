import { useState, useMemo } from 'react'
import { Card } from '@fremtind/jokul/card'
import { EmptyState } from '../common/EmptyState'
import { PlayerMetricsControls } from './PlayerMetricsControls'
import { EloHistoryChart } from './EloHistoryChart'
import { WinLossChart } from './WinLossChart'
import { OpponentStatsChart } from './OpponentStatsChart'
import { useThemeColors } from './useThemeColors'
import { usePlayerMetricsData } from './usePlayerMetricsData'
import type { PlayerMetricsProps, EloHistoryPoint } from './types'

export function PlayerMetrics({ player, matches, players }: PlayerMetricsProps) {
    const [selectedOpponent, setSelectedOpponent] = useState<string>('all')
    const [showEloHistory, setShowEloHistory] = useState(true)
    const [showWinLossRatio, setShowWinLossRatio] = useState(true)
    const [showOpponentStats, setShowOpponentStats] = useState(true)

    const chartColors = useThemeColors()
    const { playerMatches, opponentStats, eloHistory } = usePlayerMetricsData(player, matches, players)

    // Filter data based on selected opponent
    const filteredData = useMemo(() => {
        if (selectedOpponent === 'all') {
            return {
                eloHistory,
                opponentStats
            }
        }

        // Filter matches for specific opponent
        const filteredMatches = playerMatches.filter(match => {
            const isPlayer1 = match.player1Id === player.id
            const opponentId = isPlayer1 ? match.player2Id : match.player1Id
            return opponentId === selectedOpponent
        })

        // Recalculate ELO history for filtered matches
        const filteredEloHistory: EloHistoryPoint[] = []
        
        if (filteredMatches.length > 0) {
            // Use approximate starting ELO for filtered view
            let currentElo = 1200 // Default starting point for filtered view
            
            filteredMatches.forEach((match, index) => {
                const eloChange = match.eloChanges[player.id] || 0
                currentElo += eloChange
                
                const isPlayer1 = match.player1Id === player.id
                const opponentId = isPlayer1 ? match.player2Id : match.player1Id
                const opponent = players.find(p => p.id === opponentId)
                
                const matchDate = new Date(match.playedAt)
                
                filteredEloHistory.push({
                    matchNumber: index + 1,
                    elo: Math.round(currentElo),
                    date: matchDate.toLocaleDateString('no-NO'),
                    dateFormatted: matchDate.toISOString().split('T')[0], // YYYY-MM-DD format
                    opponent: opponent?.name || 'Ukjent',
                    result: match.winnerId === player.id ? 'Win' : 'Loss'
                })
            })
        }

        return {
            eloHistory: filteredEloHistory,
            opponentStats: opponentStats.filter(stat => stat.opponentId === selectedOpponent)
        }
    }, [selectedOpponent, eloHistory, opponentStats, playerMatches, player.id, players])

    // Get current theme for chart keys
    const currentTheme = typeof window !== 'undefined' ? document.body.getAttribute('data-theme') || 'light' : 'light'

    if (playerMatches.length === 0) {
        return (
            <Card className="p-4 sm:p-6">
                <EmptyState
                    title="Ingen kampdata"
                    description="Denne spilleren har ikke spilt noen kamper ennå."
                />
            </Card>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <PlayerMetricsControls
                selectedOpponent={selectedOpponent}
                onOpponentChange={setSelectedOpponent}
                showEloHistory={showEloHistory}
                onToggleEloHistory={() => setShowEloHistory(!showEloHistory)}
                showWinLossRatio={showWinLossRatio}
                onToggleWinLossRatio={() => setShowWinLossRatio(!showWinLossRatio)}
                showOpponentStats={showOpponentStats}
                onToggleOpponentStats={() => setShowOpponentStats(!showOpponentStats)}
                opponentStats={opponentStats}
            />

            {showEloHistory && (
                <EloHistoryChart
                    data={filteredData.eloHistory}
                    chartColors={chartColors}
                    currentTheme={currentTheme}
                />
            )}

            {showWinLossRatio && (
                <WinLossChart
                    player={player}
                    chartColors={chartColors}
                    currentTheme={currentTheme}
                />
            )}

            {showOpponentStats && (
                <OpponentStatsChart
                    data={filteredData.opponentStats}
                    chartColors={chartColors}
                    currentTheme={currentTheme}
                    selectedOpponent={selectedOpponent}
                />
            )}
        </div>
    )
}
