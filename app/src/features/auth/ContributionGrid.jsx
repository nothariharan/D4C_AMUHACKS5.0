import { useMemo } from 'react'
import { useStore } from '../../lib/store'

export function ContributionGrid() {
    const { sessions, activeSessionId } = useStore()
    const activeSession = sessions[activeSessionId]

    // Generate data for the last 365 days
    const heatmapData = useMemo(() => {
        const data = []
        const today = new Date()
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(today.getFullYear() - 1)

        // Flatten daily logs from active session (or all sessions if we want aggregation)
        // For simplicity, just use active session logs
        const logs = activeSession?.dailyLog || {}

        for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0]
            const log = logs[dateStr]

            let intensity = 0
            if (log) {
                if (log.tasksCompleted >= 3) intensity = 4
                else if (log.tasksCompleted >= 2) intensity = 3
                else if (log.tasksCompleted >= 1) intensity = 2
                else if (log.timeSpent > 0) intensity = 1
            }

            data.push({ date: dateStr, intensity })
        }
        return data
    }, [activeSession])

    // Color map
    const getColor = (intensity) => {
        switch (intensity) {
            case 0: return 'bg-gray-100'
            case 1: return 'bg-yellow-100' // Consumption
            case 2: return 'bg-brutal-yellow' // Moderate
            case 3: return 'bg-orange-400' // High
            case 4: return 'bg-brutal-red' // Intense (Fire)
            default: return 'bg-gray-100'
        }
    }

    return (
        <div className="w-full overflow-x-auto p-4 bg-white border-3 border-black shadow-brutal">
            <h3 className="font-bold font-mono text-sm mb-2 uppercase flex items-center gap-2">
                Consistency Heatmap
                <span className="text-xs text-gray-500 font-normal normal-case">(Last 365 Days)</span>
            </h3>

            <div className="flex gap-1 min-w-max">
                {/* Simplified rendering: Just columns of weeks would be complex to robustly implement in one go without a library
                    So we'll do a simple row of blocks for the last 30-60 days to keep it clean and performant for now,
                    or a grid of 7 rows x 52 columns if we want full GitHub style.
                */}

                {/* Let's do a 7-row grid (weeks) */}
                <div className="grid grid-rows-7 grid-flow-col gap-1">
                    {heatmapData.map((day, i) => (
                        <div
                            key={day.date}
                            className={`w-3 h-3 ${getColor(day.intensity)} border border-transparent hover:border-black transition-all`}
                            title={`${day.date}: Level ${day.intensity}`}
                        />
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2 mt-2 text-xs font-mono text-gray-500">
                <span>Less</span>
                <div className={`w-3 h-3 ${getColor(0)} `} />
                <div className={`w-3 h-3 ${getColor(1)} `} />
                <div className={`w-3 h-3 ${getColor(2)} `} />
                <div className={`w-3 h-3 ${getColor(3)} `} />
                <div className={`w-3 h-3 ${getColor(4)} `} />
                <span>More</span>
            </div>
        </div>
    )
}
