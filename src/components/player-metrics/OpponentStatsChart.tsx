import { Card } from '@fremtind/jokul/card'
import { 
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'
import type { OpponentStats, ChartColors } from './types'
import { useIsMobile } from './useIsMobile'

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
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">
                Motstanderstatistikk
                {selectedOpponent !== 'all' && ' (filtrert)'}
            </h3>
            <div className="w-full overflow-x-auto overflow-y-hidden h-[400px] sm:h-[450px]">
                <div style={{ minWidth: isMobile ? '400px' : '600px', height: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                            key={`bar-chart-${currentTheme}`}
                            data={data}
                            margin={{ 
                                top: 20, 
                                right: isMobile ? 20 : 40, 
                                left: isMobile ? 20 : 40, 
                                bottom: isMobile ? 100 : 120 
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} strokeOpacity={0.3} />
                            <XAxis 
                                dataKey="opponentName" 
                                angle={-45}
                                textAnchor="end"
                                height={isMobile ? 100 : 120}
                                interval={0}
                                tick={{ fontSize: isMobile ? 9 : 11, fill: chartColors.text }}
                                axisLine={{ stroke: chartColors.grid }}
                                tickLine={{ stroke: chartColors.grid }}
                            />
                            <YAxis 
                                width={isMobile ? 60 : 80} 
                                tick={{ fontSize: isMobile ? 10 : 12, fill: chartColors.text }}
                                axisLine={{ stroke: chartColors.grid }}
                                tickLine={{ stroke: chartColors.grid }}
                            />
                            <Tooltip 
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload as OpponentStats
                                        return (
                                            <div style={{
                                                backgroundColor: '#1f2937',
                                                color: 'white',
                                                padding: isMobile ? '8px' : '12px',
                                                border: '1px solid #4b5563',
                                                borderRadius: '8px',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                                fontSize: isMobile ? '11px' : '14px',
                                                opacity: 1,
                                                maxWidth: isMobile ? '220px' : 'none'
                                            }}>
                                                <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{label}</p>
                                                <p style={{ margin: '0 0 4px 0' }}>Seire: {data.wins}</p>
                                                <p style={{ margin: '0 0 4px 0' }}>Tap: {data.losses}</p>
                                                <p style={{ margin: '0 0 4px 0' }}>Seiersrate: {data.winRate.toFixed(1)}%</p>
                                                <p style={{ margin: '0 0 4px 0' }}>Totale kamper: {data.totalMatches}</p>
                                                <p style={{ margin: '0' }}>Gjennomsnittlig poengsum: {data.averageScore.toFixed(1)}</p>
                                            </div>
                                        )
                                    }
                                    return null
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
