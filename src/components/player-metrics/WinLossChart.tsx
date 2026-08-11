import { Card } from '@fremtind/jokul/card'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { Player } from '../../types/pong'
import type { ChartColors } from '../../types'
import { useIsMobile } from '../../hooks/useIsMobile'
import { ChartTooltip, ChartTooltipRow } from './ChartTooltip'

interface WinLossChartProps {
    player: Player
    chartColors: ChartColors
    currentTheme: string
}

export function WinLossChart({ player, chartColors, currentTheme }: WinLossChartProps) {
    const isMobile = useIsMobile()
    const winLossData = [
        { name: 'Seire', value: player.wins, color: chartColors.success },
        { name: 'Tap', value: player.losses, color: chartColors.danger },
    ]

    return (
        <Card className="p-3 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold sm:mb-6 mb-4">Seier/Tap-forhold</h3>
            <div className="flex justify-center">
                <div className="h-[280px] w-full max-w-sm overflow-hidden sm:h-[320px] sm:max-w-md">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart key={`pie-chart-${currentTheme}`}>
                            <Pie
                                data={winLossData}
                                cx="50%"
                                cy="50%"
                                outerRadius={isMobile ? 80 : 100}
                                dataKey="value"
                                label={
                                    !isMobile
                                        ? ({ name, value, percent }) =>
                                              `${name}: ${value} (${percent ? (percent * 100).toFixed(1) : 0}%)`
                                        : false
                                }
                                labelLine={false}
                            >
                                {winLossData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    const entry = payload?.[0] as { name?: string; value?: number } | undefined
                                    if (!active || !entry) return null

                                    const total = player.wins + player.losses
                                    const percent = total > 0 ? ((entry.value ?? 0) / total) * 100 : 0

                                    return (
                                        <ChartTooltip
                                            title={entry.name}
                                            chartColors={chartColors}
                                            isMobile={isMobile}
                                            maxWidth="180px"
                                        >
                                            <ChartTooltipRow>Antall: {entry.value}</ChartTooltipRow>
                                            <ChartTooltipRow last>Prosent: {percent.toFixed(1)}%</ChartTooltipRow>
                                        </ChartTooltip>
                                    )
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    )
}
