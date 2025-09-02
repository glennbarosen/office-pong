import { useState, useMemo, useEffect } from 'react'
import { Card } from '@fremtind/jokul/card'
import { NativeSelect } from '@fremtind/jokul/select'
import { Button } from '@fremtind/jokul/button'
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts'
import type { Player, Match } from '../../types/pong'
import { EmptyState } from '../common/EmptyState'

interface PlayerMetricsProps {
    player: Player
    matches: Match[]
    players: Player[]
}

interface OpponentStats {
    opponentId: string
    opponentName: string
    wins: number
    losses: number
    winRate: number
    totalMatches: number
    averageScore: number
    eloChange: number
}

interface EloHistoryPoint {
    matchNumber: number
    elo: number
    date: string
    dateFormatted: string
    opponent: string
    result: 'Win' | 'Loss'
}

export function PlayerMetrics({ player, matches, players }: PlayerMetricsProps) {
    const [selectedOpponent, setSelectedOpponent] = useState<string>('all')
    const [showEloHistory, setShowEloHistory] = useState(true)
    const [showWinLossRatio, setShowWinLossRatio] = useState(true)
    const [showOpponentStats, setShowOpponentStats] = useState(true)
    const [currentTheme, setCurrentTheme] = useState<string>('light')

    // Watch for theme changes
    useEffect(() => {
        const updateTheme = () => {
            const theme = document.body.getAttribute('data-theme') || 'light'
            setCurrentTheme(theme)
        }

        // Initial theme
        updateTheme()

        // Watch for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    updateTheme()
                }
            })
        })

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['data-theme']
        })

        return () => observer.disconnect()
    }, [])

    // Theme-aware colors
    const chartColors = {
        primary: '#3b82f6',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#06b6d4',
        // Adaptive colors based on current theme
        grid: currentTheme === 'dark' ? '#374151' : '#e5e7eb',
        text: currentTheme === 'dark' ? '#d1d5db' : '#374151',
        line: currentTheme === 'dark' ? '#60a5fa' : '#2563eb'
    }

    // Get all matches for this player
    const playerMatches = useMemo(() => {
        const filteredMatches = matches.filter(match => {
            // Try different comparison methods in case of type mismatches
            const directMatch = match.player1Id === player.id || match.player2Id === player.id
            const stringMatch = String(match.player1Id) === String(player.id) || String(match.player2Id) === String(player.id)
            const trimmedMatch = String(match.player1Id).trim() === String(player.id).trim() || String(match.player2Id).trim() === String(player.id).trim()
            
            return directMatch || stringMatch || trimmedMatch
        }).sort((a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime())
        
        return filteredMatches
    }, [matches, player.id])

    // Calculate opponent statistics
    const opponentStats = useMemo(() => {
        const stats = new Map<string, OpponentStats>()
        
        playerMatches.forEach((match) => {
            const isPlayer1 = match.player1Id === player.id
            const opponentId = isPlayer1 ? match.player2Id : match.player1Id
            const opponent = players.find(p => p.id === opponentId)
            
            if (!opponent) return

            if (!stats.has(opponentId)) {
                stats.set(opponentId, {
                    opponentId,
                    opponentName: opponent.name,
                    wins: 0,
                    losses: 0,
                    winRate: 0,
                    totalMatches: 0,
                    averageScore: 0,
                    eloChange: 0
                })
            }

            const stat = stats.get(opponentId)!
            stat.totalMatches++
            
            if (match.winnerId === player.id) {
                stat.wins++
            } else {
                stat.losses++
            }
            
            stat.winRate = (stat.wins / stat.totalMatches) * 100
            stat.eloChange += match.eloChanges[player.id] || 0
            
            const playerScore = isPlayer1 ? match.player1Score : match.player2Score
            stat.averageScore = ((stat.averageScore * (stat.totalMatches - 1)) + playerScore) / stat.totalMatches
        })

        return Array.from(stats.values()).sort((a, b) => b.totalMatches - a.totalMatches)
    }, [playerMatches, player.id, players])

    // Calculate ELO history - showing rating progression over time
    const eloHistory = useMemo(() => {
        if (playerMatches.length === 0) return []

        const history: EloHistoryPoint[] = []
        
        // Start with the starting ELO (1200) and build forward
        let runningElo = 1200 // Standard chess/ping pong starting rating
        
        playerMatches.forEach((match, index) => {
            // Apply the ELO change from this match
            const eloChange = match.eloChanges?.[player.id] || 0
            runningElo += eloChange
            
            const isPlayer1 = match.player1Id === player.id
            const opponentId = isPlayer1 ? match.player2Id : match.player1Id
            const opponent = players.find(p => p.id === opponentId)
            
            const matchDate = new Date(match.playedAt)
            
            history.push({
                matchNumber: index + 1,
                elo: Math.round(runningElo),
                date: matchDate.toLocaleDateString('no-NO'),
                dateFormatted: matchDate.toISOString().split('T')[0], // YYYY-MM-DD format
                opponent: opponent?.name || 'Ukjent',
                result: match.winnerId === player.id ? 'Win' : 'Loss'
            })
        })

        // If we have a mismatch with current ELO, adjust proportionally
        if (history.length > 0 && Math.abs(runningElo - player.eloRating) > 10) {
            const adjustment = (player.eloRating - runningElo) / history.length
            
            history.forEach((point, index) => {
                point.elo = Math.round(point.elo + (adjustment * (index + 1)))
            })
        }

        return history
    }, [playerMatches, player.id, player.eloRating, players])

    // Filter data based on selected opponent
    const filteredData = useMemo(() => {
        if (selectedOpponent === 'all') {
            return {
                eloHistory,
                opponentStats
            }
        }

        // Filter matches for specific opponent
        const filteredMatches = playerMatches.filter(match => {
            const isPlayer1 = match.player1Id === player.id
            const opponentId = isPlayer1 ? match.player2Id : match.player1Id
            return opponentId === selectedOpponent
        })

        // Recalculate ELO history for filtered matches
        const filteredEloHistory: EloHistoryPoint[] = []
        
        if (filteredMatches.length > 0) {
            // Use approximate starting ELO for filtered view
            let currentElo = 1200 // Default starting point for filtered view
            
            filteredMatches.forEach((match, index) => {
                const eloChange = match.eloChanges[player.id] || 0
                currentElo += eloChange
                
                const isPlayer1 = match.player1Id === player.id
                const opponentId = isPlayer1 ? match.player2Id : match.player1Id
                const opponent = players.find(p => p.id === opponentId)
                
                const matchDate = new Date(match.playedAt)
                
                filteredEloHistory.push({
                    matchNumber: index + 1,
                    elo: Math.round(currentElo),
                    date: matchDate.toLocaleDateString('no-NO'),
                    dateFormatted: matchDate.toISOString().split('T')[0], // YYYY-MM-DD format
                    opponent: opponent?.name || 'Ukjent',
                    result: match.winnerId === player.id ? 'Win' : 'Loss'
                })
            })
        }

        return {
            eloHistory: filteredEloHistory,
            opponentStats: opponentStats.filter(stat => stat.opponentId === selectedOpponent)
        }
    }, [selectedOpponent, eloHistory, opponentStats, playerMatches, player.id, players])

    // Win/Loss pie chart data
    const winLossData = [
        { name: 'Seire', value: player.wins, color: chartColors.success },
        { name: 'Tap', value: player.losses, color: chartColors.danger }
    ]

    if (playerMatches.length === 0) {
        return (
            <Card className="p-6">
                <EmptyState
                    title="Ingen kampdata"
                    description="Denne spilleren har ikke spilt noen kamper ennå."
                />
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Controls */}
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
                                setSelectedOpponent(event.target.value)
                            }
                            value={selectedOpponent}
                        />
                    </div>
                    
                    <div className="flex flex-wrap gap-4 pt-4" style={{ marginTop: '2rem' }}>
                        <Button
                            variant={showEloHistory ? 'primary' : 'secondary'}
                            density="compact"
                            onClick={() => setShowEloHistory(!showEloHistory)}
                            style={{ margin: '4px' }}
                        >
                            ELO-utvikling
                        </Button>
                        <Button
                            variant={showWinLossRatio ? 'primary' : 'secondary'}
                            density="compact"
                            onClick={() => setShowWinLossRatio(!showWinLossRatio)}
                            style={{ margin: '4px' }}
                        >
                            Seier/tap-forhold
                        </Button>
                        <Button
                            variant={showOpponentStats ? 'primary' : 'secondary'}
                            density="compact"
                            onClick={() => setShowOpponentStats(!showOpponentStats)}
                            style={{ margin: '4px' }}
                        >
                            Motstanderstatistikk
                        </Button>
                    </div>
                </div>
            </Card>

            {/* ELO History Chart */}
            {showEloHistory && filteredData.eloHistory.length > 0 && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-6">ELO-utvikling over tid</h3>
                    <div className="w-full overflow-hidden" style={{ height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart 
                                key={`elo-chart-${currentTheme}`}
                                data={filteredData.eloHistory}
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
            )}

            {/* Win/Loss Ratio */}
            {showWinLossRatio && (
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
            )}

            {/* Opponent Statistics */}
            {showOpponentStats && filteredData.opponentStats.length > 0 && (
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
                                    data={filteredData.opponentStats}
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
            )}
        </div>
    )
}
