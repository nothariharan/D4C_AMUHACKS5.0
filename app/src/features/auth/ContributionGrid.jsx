import { useMemo } from 'react'
import { useStore } from '../../lib/store'

export function ContributionGrid({ heatmapData: propHeatmapData }) {
    const { sessions, activeSessionId, engagementMetrics } = useStore()
    const activeSession = sessions[activeSessionId]

    // Use the prop if passed, otherwise use the global engagement metrics, fallback to empty
    const sourceData = propHeatmapData || engagementMetrics.heatmapData || {}

    // Generate data for the last 365 days
    const heatmapData = useMemo(() => {
        const data = []
        const today = new Date()
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(today.getFullYear() - 1)

        // Loop backwards from today to 365 days ago
        for (let d = new Date(today); d >= oneYearAgo; d.setDate(d.getDate() - 1)) {
            const dateStr = d.toISOString().split('T')[0]
            const count = sourceData[dateStr] || 0

            let intensity = 0
            if (count >= 10) intensity = 4
            else if (count >= 5) intensity = 3
            else if (count >= 2) intensity = 2
            else if (count >= 1) intensity = 1

            data.push({ date: dateStr, intensity })
        }
        return data
    }, [sourceData])

    // Color map
    const getColor = (intensity) => {
        switch (intensity) {
            case 0: return 'bg-gray-100'
            case 1: return 'bg-yellow-50' // Lightest
            case 2: return 'bg-yellow-200' // Light
            case 3: return 'bg-brutal-yellow' // Strong
            case 4: return 'bg-black' // Max Intensity (Black for contrast in Yellow theme)
            default: return 'bg-gray-100'
        }
    }

    return (
        <div className="w-full overflow-x-auto pt-4 pb-4 pl-4 pr-0 bg-white border-3 border-black shadow-brutal mt-2">
            <h3 className="font-bold font-mono text-sm mb-3 uppercase flex items-center gap-2">
                Consistency Heatmap
                <span className="text-xs text-gray-500 font-normal normal-case">(Last 365 Days)</span>
            </h3>

            {/* 
                RTL HANDLING: 
                'justify-end' pushes the entire grid package flush to the right. 
                'direction: rtl' ensures columns flow right-to-left internally.
            */}
            <div className="flex justify-end w-full">
                <div className="grid grid-rows-7 grid-flow-col gap-1" style={{ direction: 'rtl' }}>
                    {heatmapData.map((day, i) => (
                        <div
                            key={day.date}
                            className={`w-3.5 h-3.5 ${getColor(day.intensity)} border border-transparent hover:border-black transition-all`}
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
