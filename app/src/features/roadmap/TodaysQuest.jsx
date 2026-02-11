import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, Circle, Trophy } from 'lucide-react'
import { useStore } from '../../lib/store'

export function TodaysQuest({ onClose }) {
    const { sessions, activeSessionId, completeTask } = useStore()
    const session = sessions[activeSessionId]
    const roadmap = session?.roadmap

    // Build today's quest list: next 3-5 incomplete tasks
    const quests = []
    if (roadmap?.nodes) {
        for (const node of roadmap.nodes) {
            if (node.status === 'locked') continue
            for (const sub of (node.subNodes || [])) {
                for (let j = 0; j < (sub.tasks || []).length; j++) {
                    const task = sub.tasks[j]
                    const t = typeof task === 'string' ? { title: task, completed: false } : task
                    quests.push({
                        title: t.title,
                        completed: !!t.completed,
                        nodeId: node.id,
                        subNodeId: sub.id,
                        taskIndex: j
                    })
                    if (quests.length >= 5) break
                }
                if (quests.length >= 5) break
            }
            if (quests.length >= 5) break
        }
    }

    const completedCount = quests.filter(q => q.completed).length
    const allDone = completedCount === quests.length && quests.length > 0

    const handleToggleComplete = (quest) => {
        if (!quest.completed) {
            completeTask(quest.nodeId, quest.subNodeId, quest.taskIndex)
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-0 right-0 h-full w-80 bg-white border-l-3 border-black z-[130] shadow-[-8px_0px_0px_0px_#000] flex flex-col"
            >
                {/* Header */}
                <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
                    <h2 className="font-bold font-mono text-sm uppercase tracking-widest">📋 Today's Quest</h2>
                    <button onClick={onClose} className="hover:text-brutal-yellow transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="px-4 py-3 border-b-2 border-black">
                    <div className="flex justify-between text-xs font-mono mb-1">
                        <span>{completedCount}/{quests.length} TASKS</span>
                        <span>{quests.length > 0 ? Math.round((completedCount / quests.length) * 100) : 0}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 border border-black">
                        <motion.div
                            className="h-full bg-brutal-green"
                            initial={{ width: 0 }}
                            animate={{ width: `${quests.length > 0 ? (completedCount / quests.length) * 100 : 0}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>

                {/* Quest List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {quests.map((quest, idx) => (
                        <motion.button
                            key={`${quest.subNodeId}-${quest.taskIndex}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            onClick={() => handleToggleComplete(quest)}
                            disabled={quest.completed}
                            className={`w-full text-left flex items-start gap-3 p-3 border-2 border-black transition-all
                                ${quest.completed
                                    ? 'bg-brutal-green/20 line-through text-gray-500'
                                    : 'bg-white hover:bg-brutal-yellow/30 shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5'
                                }
                            `}
                        >
                            {quest.completed ? (
                                <CheckCircle2 size={18} className="text-brutal-green flex-shrink-0 mt-0.5" />
                            ) : (
                                <Circle size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
                            )}
                            <span className="font-mono text-sm font-bold uppercase leading-snug">
                                {quest.title}
                            </span>
                        </motion.button>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t-2 border-black">
                    {allDone ? (
                        <div className="flex items-center justify-center gap-2 bg-brutal-green text-black px-4 py-3 font-bold font-mono text-sm uppercase border-2 border-black">
                            <Trophy size={18} /> Day Complete! 🎉
                        </div>
                    ) : (
                        <div className="text-center font-mono text-xs text-gray-400 uppercase">
                            Complete all tasks to finish today
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
