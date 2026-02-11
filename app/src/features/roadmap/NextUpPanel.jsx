import { motion } from 'framer-motion'
import { Play, ChevronRight } from 'lucide-react'

export function NextUpPanel({ nodes, onTaskClick }) {
    if (!nodes || nodes.length === 0) return null

    // Find first 3 incomplete tasks across all unlocked nodes
    const nextTasks = []
    for (const node of nodes) {
        if (node.status === 'locked') continue
        for (const sub of (node.subNodes || [])) {
            for (let j = 0; j < (sub.tasks || []).length; j++) {
                const task = sub.tasks[j]
                const t = typeof task === 'string' ? { title: task } : task
                if (!t.completed) {
                    nextTasks.push({
                        title: t.title,
                        nodeId: node.id,
                        subNodeId: sub.id,
                        taskIndex: j,
                        isFirst: nextTasks.length === 0
                    })
                }
                if (nextTasks.length >= 3) break
            }
            if (nextTasks.length >= 3) break
        }
        if (nextTasks.length >= 3) break
    }

    if (nextTasks.length === 0) return null

    return (
        <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="fixed bottom-6 right-6 z-[90] w-96"
        >
            <div className="bg-white border-3 border-black shadow-brutal">
                <div className="bg-black text-white px-5 py-3 font-mono text-base font-bold uppercase tracking-wider flex items-center gap-2">
                    <Play size={20} fill="currentColor" /> Next Up
                </div>
                <div className="divide-y-2 divide-black">
                    {nextTasks.map((task, idx) => (
                        <button
                            key={`${task.subNodeId}-${task.taskIndex}`}
                            onClick={() => onTaskClick({ nodeId: task.nodeId, subNodeId: task.subNodeId, taskIndex: task.taskIndex })}
                            className={`w-full text-left px-5 py-4 flex items-center gap-4 transition-all hover:bg-brutal-yellow group
                                ${idx === 0 ? 'bg-gray-50' : 'bg-white'}
                            `}
                        >
                            {idx === 0 ? (
                                <Play size={20} className="text-brutal-green flex-shrink-0" fill="currentColor" />
                            ) : (
                                <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
                            )}
                            <span className={`font-mono text-base uppercase truncate ${idx === 0 ? 'font-bold' : 'text-gray-600'}`}>
                                {task.title}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}
