import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronRight, Plus } from 'lucide-react'
import { useStore } from '../../lib/store'

export function Sidebar() {
    const [isOpen, setIsOpen] = useState(false)
    const { sessions, activeSessionId, switchSession, reset } = useStore()

    // Sort sessions by creation time desc
    const sessionList = Object.values(sessions).sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    )

    const handleNewGoal = () => {
        reset() // Set activeSessionId to null -> Landing
        setIsOpen(false)
    }

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-4 left-4 z-50 p-2 bg-white border-3 border-black shadow-brutal hover:translate-y-1 hover:shadow-none transition-all"
            >
                <Menu size={24} />
            </button>

            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 20 }}
                        className="fixed top-0 left-0 h-full w-80 bg-brutal-white border-r-3 border-black z-50 flex flex-col shadow-[4px_0px_0px_0px_#000]"
                    >
                        <div className="p-4 border-b-3 border-black flex justify-between items-center bg-brutal-yellow">
                            <h2 className="font-black text-xl uppercase">Your Goals</h2>
                            <button onClick={() => setIsOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <button
                                onClick={handleNewGoal}
                                className="w-full flex items-center justify-center gap-2 p-3 border-3 border-black border-dashed hover:bg-white hover:border-solid transition-all font-bold"
                            >
                                <Plus size={20} />
                                NEW GOAL
                            </button>

                            {sessionList.map(session => (
                                <div
                                    key={session.id}
                                    onClick={() => { switchSession(session.id); setIsOpen(false); }}
                                    className={`
                                        cursor-pointer p-3 border-3 border-black shadow-brutal hover:translate-x-1 hover:shadow-none transition-all text-left group
                                        ${activeSessionId === session.id ? 'bg-brutal-blue text-white' : 'bg-white'}
                                    `}
                                >
                                    <h3 className="font-bold text-lg leading-tight group-hover:underline">
                                        {session.role || session.goal}
                                    </h3>
                                    <div className="flex justify-between items-center mt-2 text-xs font-mono opacity-80">
                                        <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                                        <span className="uppercase">{session.phase}</span>
                                    </div>
                                </div>
                            ))}

                            {sessionList.length === 0 && (
                                <div className="text-center opacity-50 font-mono text-sm mt-8">
                                    No goals yet. Start one!
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
