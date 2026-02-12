import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, Circle, Trophy, Zap, Target, Flame } from 'lucide-react'
import { useStore } from '../../lib/store'

// Simple hash function for date-based stable randomization
const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

export function TodaysQuest({ isOpen, onClose }) {
    const { sessions, completeTask } = useStore()

    // 1. Aggregation Phase: Get ALL available (unlocked) tasks across all goals
    const allAvailableQuests = useMemo(() => {
        const quests = [];
        Object.values(sessions).forEach(session => {
            const roadmap = session.roadmap;
            if (!roadmap?.nodes) return;

            roadmap.nodes.forEach(node => {
                // Only consider unlocked or active nodes
                if (node.status === 'locked') return;

                (node.subNodes || []).forEach(sub => {
                    (sub.tasks || []).forEach((task, j) => {
                        const t = typeof task === 'string' ? { title: task, completed: false } : task;
                        quests.push({
                            id: `${session.id}-${node.id}-${sub.id}-${j}`,
                            title: t.title,
                            completed: !!t.completed,
                            sessionId: session.id,
                            sessionGoal: session.goal || session.role,
                            nodeId: node.id,
                            subNodeId: sub.id,
                            taskIndex: j
                        });
                    });
                });
            });
        });
        return quests;
    }, [sessions]);

    // 2. Selection Phase: Pick 5 tasks based on today's date
    const dailyQuests = useMemo(() => {
        if (allAvailableQuests.length === 0) return [];

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const seed = hashString(today);

        // Sort by ID to ensure order is stable before picking
        const pool = [...allAvailableQuests].sort((a, b) => a.id.localeCompare(b.id));
        const poolSize = pool.length;

        if (poolSize <= 5) return pool;

        const selection = [];
        const availableIndices = Array.from({ length: poolSize }, (_, i) => i);

        // Pick 5 unique indices using the seed
        for (let i = 0; i < 5 && availableIndices.length > 0; i++) {
            // Use a larger prime multiplier (131) and include i to shift the pick
            const pickIdx = (seed + i * 131) % availableIndices.length;
            const poolIdx = availableIndices.splice(pickIdx, 1)[0];
            selection.push(pool[poolIdx]);
        }

        return selection;
    }, [allAvailableQuests]);

    const completedCount = dailyQuests.filter(q => q.completed).length
    const allDone = completedCount === dailyQuests.length && dailyQuests.length > 0

    const handleToggleComplete = (quest) => {
        if (!quest.completed) {
            completeTask(quest.nodeId, quest.subNodeId, quest.taskIndex, quest.sessionId);
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed top-0 right-0 h-full w-96 bg-white border-l-4 border-black z-[1000] shadow-[-12px_0px_0px_0px_#000] flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-brutal-yellow text-black px-6 py-4 border-b-4 border-black flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Flame size={24} strokeWidth={3} className="text-brutal-red" />
                            <h2 className="font-black uppercase italic tracking-tight text-xl">Daily Ritual</h2>
                        </div>
                        <button onClick={onClose} className="hover:rotate-90 transition-transform">
                            <X size={28} strokeWidth={3} />
                        </button>
                    </div>

                    {/* Progress Monitor */}
                    <div className="p-6 border-b-4 border-black bg-black text-white">
                        <div className="flex justify-between items-end mb-3">
                            <div>
                                <h3 className="text-xs font-black text-brutal-yellow uppercase tracking-widest">Efficiency</h3>
                                <p className="text-3xl font-black uppercase tracking-tighter italic">
                                    {completedCount}/{dailyQuests.length} <span className="text-xs font-mono not-italic text-gray-500">TASKS_SYNCED</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-black italic">
                                    {dailyQuests.length > 0 ? Math.round((completedCount / dailyQuests.length) * 100) : 0}%
                                </span>
                            </div>
                        </div>
                        <div className="w-full h-6 bg-gray-800 border-2 border-white p-1">
                            <motion.div
                                className="h-full bg-brutal-green"
                                initial={{ width: 0 }}
                                animate={{ width: `${dailyQuests.length > 0 ? (completedCount / dailyQuests.length) * 100 : 0}%` }}
                            />
                        </div>
                    </div>

                    {/* Quest Feed */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                        {dailyQuests.length === 0 ? (
                            <div className="text-center py-20 animate-pulse">
                                <Zap className="mx-auto text-gray-300 mb-4" size={48} />
                                <p className="font-mono text-xs text-gray-400 uppercase">Awaiting Active Mission Parameters...</p>
                            </div>
                        ) : (
                            dailyQuests.map((quest, idx) => (
                                <motion.div
                                    key={quest.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`relative group bg-white border-3 border-black p-4 transition-all shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1
                                        ${quest.completed ? 'bg-brutal-green/10' : ''}
                                    `}
                                >
                                    <div className="flex items-start gap-4">
                                        <button
                                            onClick={() => handleToggleComplete(quest)}
                                            disabled={quest.completed}
                                            className={`mt-1 shrink-0 w-6 h-6 border-2 border-black flex items-center justify-center transition-colors
                                                ${quest.completed ? 'bg-black text-white' : 'hover:bg-brutal-yellow'}
                                            `}
                                        >
                                            {quest.completed && <CheckCircle2 size={16} />}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-brutal-blue uppercase tracking-widest mb-1 truncate">
                                                MISSION: {quest.sessionGoal}
                                            </p>
                                            <p className={`font-mono text-sm font-bold uppercase leading-tight
                                                ${quest.completed ? 'line-through text-gray-400' : 'text-black'}
                                            `}>
                                                {quest.title}
                                            </p>
                                        </div>
                                    </div>

                                    {!quest.completed && (
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Target size={14} className="text-brutal-red" />
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Footer Status */}
                    <div className="p-6 border-t-4 border-black bg-white">
                        {allDone ? (
                            <div className="bg-black text-white p-4 text-center rotate-1">
                                <Trophy size={32} className="text-brutal-yellow mx-auto mb-2" />
                                <h4 className="text-xl font-black uppercase italic">Day Terminated</h4>
                                <p className="text-[10px] font-mono opacity-60">ALL DAILY PARAMETERS ACHIEVED</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="font-mono text-[10px] text-gray-400 uppercase tracking-tighter">
                                    Quest status persists across all active roadmaps.
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
