import { Card } from '@fremtind/jokul/card'
import { NativeSelect } from '@fremtind/jokul/select'
import { Button } from '@fremtind/jokul/button'
import type { OpponentStats } from './types'

interface PlayerMetricsControlsProps {
    selectedOpponent: string
    onOpponentChange: (value: string) => void
    showEloHistory: boolean
    onToggleEloHistory: () => void
    showWinLossRatio: boolean
    onToggleWinLossRatio: () => void
    showOpponentStats: boolean
    onToggleOpponentStats: () => void
    opponentStats: OpponentStats[]
}

export function PlayerMetricsControls({
    selectedOpponent,
    onOpponentChange,
    showEloHistory,
    onToggleEloHistory,
    showWinLossRatio,
    onToggleWinLossRatio,
    showOpponentStats,
    onToggleOpponentStats,
    opponentStats,
}: PlayerMetricsControlsProps) {
    return (
        <Card className="p-4 sm:p-8">
            <div className="space-y-6 sm:space-y-8">
                <div>
                    {/* Jøkul renders and associates the label itself; a bare <label> here
                        was visually adjacent but tied to no control. */}
                    <NativeSelect
                        name="opponent-filter"
                        label="Filtrer mot motstander"
                        items={[
                            { value: 'all', label: 'Alle motstandere' },
                            ...opponentStats.map((stat) => ({
                                value: stat.opponentId,
                                label: `${stat.opponentName} (${stat.totalMatches} kamper)`,
                            })),
                        ]}
                        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => onOpponentChange(event.target.value)}
                        value={selectedOpponent}
                    />
                </div>

                <div className="flex flex-wrap gap-2 pt-4 sm:gap-4" style={{ marginTop: '1.5rem' }}>
                    <Button
                        variant={showEloHistory ? 'primary' : 'secondary'}
                        density="compact"
                        onClick={onToggleEloHistory}
                        className="text-xs sm:text-sm sm:px-3 py-1 px-2 sm:py-2"
                    >
                        ELO-utvikling
                    </Button>
                    <Button
                        variant={showWinLossRatio ? 'primary' : 'secondary'}
                        density="compact"
                        onClick={onToggleWinLossRatio}
                        className="text-xs sm:text-sm sm:px-3 py-1 px-2 sm:py-2"
                    >
                        Seier/tap-forhold
                    </Button>
                    <Button
                        variant={showOpponentStats ? 'primary' : 'secondary'}
                        density="compact"
                        onClick={onToggleOpponentStats}
                        className="text-xs sm:text-sm sm:px-3 py-1 px-2 sm:py-2"
                    >
                        Motstanderstatistikk
                    </Button>
                </div>
            </div>
        </Card>
    )
}
