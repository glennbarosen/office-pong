import { Card } from '@fremtind/jokul/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { OpponentStats, ChartColors } from '../../types'
import { useIsMobile } from './useIsMobile'
import { ChartTooltip, ChartTooltipRow } from './ChartTooltip'
import { firstPayload } from './chartPayload'
import { categoryAxisProps, axisProps, yAxisWidth } from './chartAxes'

interface OpponentStatsChartProps {
    data: OpponentStats[]
    chartColors: ChartColors
    currentTheme: string
    selectedOpponent: string
}

export function OpponentStatsChart({ data, chartColors, currentTheme, selectedOpponent }: OpponentStatsChartProps) {
    const isMobile = useIsMobile()
    if (data.length === 0) return null

    return (
        <Card className="p-3 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold sm:mb-6 mb-4">
                Motstanderstatistikk
                {selectedOpponent !== 'all' && ' (filtrert)'}
            </h3>
            <div className="h-[400px] w-full overflow-x-auto overflow-y-hidden sm:h-[450px]">
                <div style={{ minWidth: isMobile ? '400px' : '600px', height: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            key={`bar-chart-${currentTheme}`}
                            data={data}
                            margin={{
                                top: 20,
                                right: isMobile ? 20 : 40,
                                left: isMobile ? 20 : 40,
                                bottom: isMobile ? 100 : 120,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} strokeOpacity={0.3} />
                            <XAxis
                                dataKey={(stat: OpponentStats) => stat.opponent.name}
                                angle={-45}
                                textAnchor="end"
                                height={isMobile ? 100 : 120}
                                interval={0}
                                {...categoryAxisProps(chartColors, isMobile)}
                            />
                            <YAxis width={yAxisWidth(isMobile)} {...axisProps(chartColors, isMobile)} />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    const stat = firstPayload<OpponentStats>(payload)
                                    if (!active || !stat) return null

                                    return (
                                        <ChartTooltip
                                            title={label}
                                            chartColors={chartColors}
                                            isMobile={isMobile}
                                            maxWidth="220px"
                                        >
                                            <ChartTooltipRow>Seire: {stat.wins}</ChartTooltipRow>
                                            <ChartTooltipRow>Tap: {stat.losses}</ChartTooltipRow>
                                            <ChartTooltipRow>Seiersrate: {stat.winRate.toFixed(1)}%</ChartTooltipRow>
                                            <ChartTooltipRow>Totale kamper: {stat.totalMatches}</ChartTooltipRow>
                                            <ChartTooltipRow last>
                                                Gjennomsnittlig poengsum: {stat.averageScore.toFixed(1)}
                                            </ChartTooltipRow>
                                        </ChartTooltip>
                                    )
                                }}
                            />
                            <Bar dataKey="wins" stackId="a" fill={chartColors.success} name="Seire" />
                            <Bar dataKey="losses" stackId="a" fill={chartColors.danger} name="Tap" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    )
}
