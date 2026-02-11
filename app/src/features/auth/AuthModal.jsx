import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useStore } from '../../lib/store'
import { SignupForm } from './SignupForm'

export function AuthModal() {
    const { engagementMetrics, closeTrap, sessions, activeSessionId } = useStore()
    const activeSession = sessions[activeSessionId]
    const [view, setView] = useState('trap') // 'trap', 'signup'

    if (!engagementMetrics.showTrap) return null

    // Calculate metrics for display
    const milestones = activeSession?.roadmap?.nodes?.length || 0
    const tasksCompleted = activeSession?.dailyLog ? Object.values(activeSession.dailyLog).reduce((acc, log) => acc + log.tasksCompleted, 0) : 0

    // Calculate total days planned (rough estimate or real data)
    const daysPlanned = activeSession?.deadline ? Math.ceil((new Date(activeSession.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : 89

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
            >
                <div className="w-full max-w-lg">
                    {view === 'trap' ? (
                        <div className="bg-white border-[8px] border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
                            {/* Header */}
                            <div className="bg-brutal-black text-white p-6 text-center border-b-[8px] border-black">
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-brutal-red animate-pulse">
                                    ⚠️ Progress Not Saved
                                </h2>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <p className="font-mono text-gray-600 text-sm uppercase">You've built a roadmap for:</p>
                                    <h3 className="text-2xl font-bold uppercase leading-tight">
                                        "{activeSession?.role || activeSession?.goal || 'Your Career'}"
                                    </h3>
                                </div>

                                <div className="w-full h-1 bg-black" />

                                <div className="grid grid-cols-1 gap-4 font-mono">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">📊</span>
                                        <span className="font-bold">{milestones} milestones mapped</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">✓</span>
                                        <span className="font-bold">{tasksCompleted} task{tasksCompleted !== 1 && 's'} completed</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">⏱️</span>
                                        <span className="font-bold">{daysPlanned} days planned</span>
                                    </div>
                                </div>

                                <div className="bg-gray-100 p-4 border-l-4 border-black font-mono text-sm">
                                    This will disappear when you leave.
                                </div>

                                <div className="flex flex-col gap-3 pt-4">
                                    <button
                                        onClick={() => setView('signup')}
                                        className="w-full py-4 bg-brutal-yellow text-black font-black text-xl uppercase border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all"
                                    >
                                        Save My Work
                                        <span className="block text-xs font-normal font-mono normal-case mt-1">(Takes 30 seconds)</span>
                                    </button>

                                    {/* Honest Escape - but with confirmation */}
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Are you sure? Your progress will be lost locally if you clear your cache.")) {
                                                closeTrap()
                                            }
                                        }}
                                        className="w-full py-3 bg-white text-gray-500 font-bold text-sm uppercase border-2 border-transparent hover:text-red-600 hover:border-red-600 transition-all font-mono"
                                    >
                                        Start Over (Lose Progress)
                                    </button>
                                </div>

                                <p className="text-center font-mono text-xs text-gray-400 mt-4">
                                    No credit card. No trial. Just email.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <SignupForm onCancel={() => setView('trap')} />
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
