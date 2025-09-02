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
    opponentStats
}: PlayerMetricsControlsProps) {
    return (
        <Card className="p-8">
            <div className="space-y-8">
                <div>
                    <label className="block text-sm font-medium mb-3">
                        Filtrer mot motstander
                    </label>
                    <NativeSelect
                        name="opponent-filter"
                        label=""
                        items={[
                            { value: 'all', label: 'Alle motstandere' },
                            ...opponentStats.map(stat => ({
                                value: stat.opponentId,
                                label: `${stat.opponentName} (${stat.totalMatches} kamper)`
                            }))
                        ]}
                        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => 
                            onOpponentChange(event.target.value)
                        }
                        value={selectedOpponent}
                    />
                </div>
                
                <div className="flex flex-wrap gap-4 pt-4" style={{ marginTop: '2rem' }}>
                    <Button
                        variant={showEloHistory ? 'primary' : 'secondary'}
                        density="compact"
                        onClick={onToggleEloHistory}
                        style={{ margin: '4px' }}
                    >
                        ELO-utvikling
                    </Button>
                    <Button
                        variant={showWinLossRatio ? 'primary' : 'secondary'}
                        density="compact"
                        onClick={onToggleWinLossRatio}
                        style={{ margin: '4px' }}
                    >
                        Seier/tap-forhold
                    </Button>
                    <Button
                        variant={showOpponentStats ? 'primary' : 'secondary'}
                        density="compact"
                        onClick={onToggleOpponentStats}
                        style={{ margin: '4px' }}
                    >
                        Motstanderstatistikk
                    </Button>
                </div>
            </div>
        </Card>
    )
}
