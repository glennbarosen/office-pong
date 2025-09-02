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

interface OpponentStatsChartProps {
    data: OpponentStats[]
    chartColors: ChartColors
    currentTheme: string
    selectedOpponent: string
}

export function OpponentStatsChart({ data, chartColors, currentTheme, selectedOpponent }: OpponentStatsChartProps) {
    if (data.length === 0) return null

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">
                Motstanderstatistikk
                {selectedOpponent !== 'all' && ' (filtrert)'}
            </h3>
            <div className="w-full overflow-x-auto overflow-y-hidden" style={{ height: '450px' }}>
                <div style={{ minWidth: '600px', height: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                            key={`bar-chart-${currentTheme}`}
                            data={data}
                            margin={{ top: 20, right: 40, left: 40, bottom: 120 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} strokeOpacity={0.3} />
                            <XAxis 
                                dataKey="opponentName" 
                                angle={-45}
                                textAnchor="end"
                                height={120}
                                interval={0}
                                tick={{ fontSize: 11, fill: chartColors.text }}
                                axisLine={{ stroke: chartColors.grid }}
                                tickLine={{ stroke: chartColors.grid }}
                            />
                            <YAxis 
                                width={80} 
                                tick={{ fontSize: 12, fill: chartColors.text }}
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
                                                padding: '12px',
                                                border: '1px solid #4b5563',
                                                borderRadius: '8px',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                                fontSize: '14px',
                                                opacity: 1
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
