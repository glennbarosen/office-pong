import { useState, useMemo } from 'react'
import { Card } from '@fremtind/jokul/card'
import { EmptyState } from '../common/EmptyState'
import { PlayerMetricsControls } from './PlayerMetricsControls'
import { EloHistoryChart } from './EloHistoryChart'
import { WinLossChart } from './WinLossChart'
import { OpponentStatsChart } from './OpponentStatsChart'
import { useThemeColors } from './useThemeColors'
import { useTheme } from '../../hooks/useTheme'
import { deriveEloHistory, usePlayerMetricsData } from './usePlayerMetricsData'
import type { PlayerMetricsProps } from './types'

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
                opponentStats,
            }
        }

        const filteredMatches = playerMatches.filter((match) => {
            const isPlayer1 = match.player1Id === player.id
            const opponentId = isPlayer1 ? match.player2Id : match.player1Id
            return opponentId === selectedOpponent
        })

        return {
            // No reconciliation for a filtered curve — a series covering one
            // opponent is not expected to end at the player's overall rating.
            eloHistory: deriveEloHistory(filteredMatches, player, players),
            opponentStats: opponentStats.filter((stat) => stat.opponent.id === selectedOpponent),
        }
    }, [selectedOpponent, eloHistory, opponentStats, playerMatches, player, players])

    // Chart `key`s include the theme so Recharts remounts and repaints on a
    // theme switch. From useTheme — the one owner — not a third read of
    // body[data-theme].
    const { theme: currentTheme } = useTheme()

    if (playerMatches.length === 0) {
        return (
            <Card padding="m">
                <EmptyState title="Ingen kampdata" description="Denne spilleren har ikke spilt noen kamper ennå." />
            </Card>
        )
    }

    return (
        <div className="space-y-16 sm:space-y-24">
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
                <EloHistoryChart data={filteredData.eloHistory} chartColors={chartColors} currentTheme={currentTheme} />
            )}

            {showWinLossRatio && <WinLossChart player={player} chartColors={chartColors} currentTheme={currentTheme} />}

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
