import { Card } from '@fremtind/jokul/card'
import { 
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from 'recharts'
import type { Player } from '../../types/pong'
import type { ChartColors } from './types'

interface WinLossChartProps {
    player: Player
    chartColors: ChartColors
    currentTheme: string
}

export function WinLossChart({ player, chartColors, currentTheme }: WinLossChartProps) {
    const winLossData = [
        { name: 'Seire', value: player.wins, color: chartColors.success },
        { name: 'Tap', value: player.losses, color: chartColors.danger }
    ]

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Seier/Tap-forhold</h3>
            <div className="flex justify-center">
                <div className="w-full max-w-md overflow-hidden" style={{ height: '320px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart key={`pie-chart-${currentTheme}`}>
                            <Pie
                                data={winLossData}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                dataKey="value"
                                label={({ name, value, percent }) => 
                                    `${name}: ${value} (${percent ? (percent * 100).toFixed(1) : 0}%)`
                                }
                                labelLine={false}
                            >
                                {winLossData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
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
                                                <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{payload[0].name}</p>
                                                <p style={{ margin: '0 0 4px 0' }}>Antall: {payload[0].value}</p>
                                                <p style={{ margin: '0' }}>Prosent: {((payload[0].value as number / (player.wins + player.losses)) * 100).toFixed(1)}%</p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    )
}
