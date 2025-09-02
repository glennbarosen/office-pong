import { Card } from '@fremtind/jokul/card'
import { 
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'
import type { EloHistoryPoint, ChartColors } from './types'

interface EloHistoryChartProps {
    data: EloHistoryPoint[]
    chartColors: ChartColors
    currentTheme: string
}

export function EloHistoryChart({ data, chartColors, currentTheme }: EloHistoryChartProps) {
    if (data.length === 0) return null

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">ELO-utvikling over tid</h3>
            <div className="w-full overflow-hidden" style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                        key={`elo-chart-${currentTheme}`}
                        data={data}
                        margin={{ top: 20, right: 40, left: 40, bottom: 80 }}
                    >
                        <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke={chartColors.grid}
                            strokeOpacity={0.3}
                        />
                        <XAxis 
                            dataKey="matchNumber" 
                            label={{ 
                                value: '📈 Viser ELO-rating utvikling gjennom alle kamper. Hover over punktene for detaljer.', 
                                position: 'insideBottom', 
                                offset: -15,
                                style: { 
                                    fill: chartColors.text,
                                    fontSize: '12px'
                                }
                            }}
                            tick={{ fontSize: 12, fill: chartColors.text }}
                            axisLine={{ stroke: chartColors.grid }}
                            tickLine={{ stroke: chartColors.grid }}
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
                                    textAnchor: 'middle'
                                }
                            }}
                            width={80}
                            tick={{ fontSize: 12, fill: chartColors.text }}
                            axisLine={{ stroke: chartColors.grid }}
                            tickLine={{ stroke: chartColors.grid }}
                            domain={['dataMin - 50', 'dataMax + 50']}
                        />
                        <Tooltip 
                            formatter={(value) => [value, 'ELO Rating']}
                            labelFormatter={(label) => `Kamp ${label}`}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload as EloHistoryPoint
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
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>Kamp {label}</p>
                                            <p style={{ margin: '0 0 4px 0' }}>ELO: {data.elo}</p>
                                            <p style={{ margin: '0 0 4px 0' }}>Motstander: {data.opponent}</p>
                                            <p style={{ margin: '0 0 4px 0' }}>
                                                Resultat: <span style={{ 
                                                    color: data.result === 'Win' ? '#34d399' : '#f87171', 
                                                    fontWeight: 'bold' 
                                                }}>
                                                    {data.result === 'Win' ? 'Seier' : 'Tap'}
                                                </span>
                                            </p>
                                            <p style={{ margin: '0' }}>Dato: {data.date}</p>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="elo" 
                            stroke={chartColors.line} 
                            strokeWidth={3}
                            dot={{ fill: chartColors.line, strokeWidth: 2, r: 5 }}
                            activeDot={{ r: 8, stroke: chartColors.line, strokeWidth: 2, fill: '#ffffff' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    )
}
