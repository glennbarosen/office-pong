import { Card } from '@fremtind/jokul/card'
import { NativeSelect } from '@fremtind/jokul/select'
import { Button } from '@fremtind/jokul/button'
import type { OpponentStats } from '../../types'

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
        <Card padding="m">
            <div className="space-y-16 sm:space-y-24">
                <div>
                    {/* Jøkul renders and associates the label itself; a bare <label> here
                        was visually adjacent but tied to no control. */}
                    <NativeSelect
                        name="opponent-filter"
                        label="Filtrer mot motstander"
                        items={[
                            { value: 'all', label: 'Alle motstandere' },
                            ...opponentStats.map((stat) => ({
                                value: stat.opponent.id,
                                label: `${stat.opponent.name} (${stat.totalMatches} kamper)`,
                            })),
                        ]}
                        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => onOpponentChange(event.target.value)}
                        value={selectedOpponent}
                    />
                </div>

                <div className="flex flex-wrap gap-8 pt-16 sm:gap-12">
                    <Button
                        variant={showEloHistory ? 'primary' : 'secondary'}
                        density="compact"
                        onClick={onToggleEloHistory}
                        className="text-xs sm:text-sm"
                    >
                        ELO-utvikling
                    </Button>
                    <Button
                        variant={showWinLossRatio ? 'primary' : 'secondary'}
                        density="compact"
                        onClick={onToggleWinLossRatio}
                        className="text-xs sm:text-sm"
                    >
                        Seier/tap-forhold
                    </Button>
                    <Button
                        variant={showOpponentStats ? 'primary' : 'secondary'}
                        density="compact"
                        onClick={onToggleOpponentStats}
                        className="text-xs sm:text-sm"
                    >
                        Motstanderstatistikk
                    </Button>
                </div>
            </div>
        </Card>
    )
}
