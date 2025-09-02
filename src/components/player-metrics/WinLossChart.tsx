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
import { useIsMobile } from './useIsMobile'

interface WinLossChartProps {
    player: Player
    chartColors: ChartColors
    currentTheme: string
}

export function WinLossChart({ player, chartColors, currentTheme }: WinLossChartProps) {
    const isMobile = useIsMobile()
    const winLossData = [
        { name: 'Seire', value: player.wins, color: chartColors.success },
        { name: 'Tap', value: player.losses, color: chartColors.danger }
    ]

    return (
        <Card className="p-3 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Seier/Tap-forhold</h3>
            <div className="flex justify-center">
                <div className="w-full max-w-sm sm:max-w-md overflow-hidden h-[280px] sm:h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart key={`pie-chart-${currentTheme}`}>
                            <Pie
                                data={winLossData}
                                cx="50%"
                                cy="50%"
                                outerRadius={isMobile ? 80 : 100}
                                dataKey="value"
                                label={!isMobile ? ({ name, value, percent }) => 
                                    `${name}: ${value} (${percent ? (percent * 100).toFixed(1) : 0}%)`
                                : false}
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
                                                padding: isMobile ? '8px' : '12px',
                                                border: '1px solid #4b5563',
                                                borderRadius: '8px',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                                fontSize: isMobile ? '12px' : '14px',
                                                opacity: 1,
                                                maxWidth: isMobile ? '180px' : 'none'
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
