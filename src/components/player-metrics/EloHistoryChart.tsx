import { Card } from '@fremtind/jokul/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { EloHistoryPoint, ChartColors } from '../../types'
import { useIsMobile } from '../../hooks/useIsMobile'
import { ChartTooltip, ChartTooltipRow } from './ChartTooltip'
import { firstPayload } from './chartPayload'
import { axisProps, yAxisWidth } from './chartAxes'

interface EloHistoryChartProps {
    data: EloHistoryPoint[]
    chartColors: ChartColors
    currentTheme: string
}

export function EloHistoryChart({ data, chartColors, currentTheme }: EloHistoryChartProps) {
    const isMobile = useIsMobile()
    if (data.length === 0) return null

    return (
        <Card className="p-3 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold sm:mb-6 mb-4">ELO-utvikling over tid</h3>
            <div className="h-[300px] w-full overflow-hidden sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        key={`elo-chart-${currentTheme}`}
                        data={data}
                        margin={{
                            top: 20,
                            right: isMobile ? 10 : 40,
                            left: isMobile ? 10 : 40,
                            bottom: isMobile ? 60 : 80,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} strokeOpacity={0.3} />
                        <XAxis
                            dataKey="matchNumber"
                            label={
                                !isMobile
                                    ? {
                                          value: '📈 Viser ELO-rating utvikling gjennom alle kamper. Hover over punktene for detaljer.',
                                          position: 'insideBottom',
                                          offset: -15,
                                          style: {
                                              fill: chartColors.text,
                                              fontSize: '12px',
                                          },
                                      }
                                    : undefined
                            }
                            {...axisProps(chartColors, isMobile)}
                            type="number"
                            scale="linear"
                            domain={['dataMin', 'dataMax']}
                        />
                        <YAxis
                            label={{
                                value: 'ELO Rating',
                                angle: -90,
                                position: 'insideLeft',
                                style: {
                                    fill: chartColors.text,
                                    textAnchor: 'middle',
                                    fontSize: isMobile ? '10px' : '12px',
                                },
                            }}
                            width={yAxisWidth(isMobile)}
                            {...axisProps(chartColors, isMobile)}
                            domain={['dataMin - 50', 'dataMax + 50']}
                        />
                        <Tooltip
                            formatter={(value) => [value, 'ELO Rating']}
                            labelFormatter={(label) => `Kamp ${label}`}
                            content={({ active, payload, label }) => {
                                const point = firstPayload<EloHistoryPoint>(payload)
                                if (!active || !point) return null

                                const isWin = point.result === 'Win'

                                return (
                                    <ChartTooltip title={`Kamp ${label}`} chartColors={chartColors} isMobile={isMobile}>
                                        <ChartTooltipRow>ELO: {point.elo}</ChartTooltipRow>
                                        <ChartTooltipRow>Motstander: {point.opponent}</ChartTooltipRow>
                                        <ChartTooltipRow>
                                            Resultat:{' '}
                                            <span
                                                style={{
                                                    color: isWin
                                                        ? chartColors.tooltipSuccess
                                                        : chartColors.tooltipDanger,
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                {isWin ? 'Seier' : 'Tap'}
                                            </span>
                                        </ChartTooltipRow>
                                        <ChartTooltipRow last>Dato: {point.date}</ChartTooltipRow>
                                    </ChartTooltip>
                                )
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="elo"
                            stroke={chartColors.line}
                            strokeWidth={isMobile ? 2 : 3}
                            dot={{
                                fill: chartColors.line,
                                strokeWidth: 2,
                                r: isMobile ? 3 : 5,
                            }}
                            activeDot={{
                                r: isMobile ? 6 : 8,
                                stroke: chartColors.line,
                                strokeWidth: 2,
                                fill: '#ffffff',
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    )
}
