import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, ArrowRight, Clock } from 'lucide-react'

export function AddRoadmapModal({ onClose, onSubmit }) {
    const [goal, setGoal] = useState('')
    const [deadline, setDeadline] = useState('')
    const [step, setStep] = useState(1) // 1 = Goal, 2 = Deadline
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async () => {
        if (isLoading || deadline.length === 0) return
        setIsLoading(true)
        try {
            await onSubmit(goal, deadline)
            onClose()
        } catch (err) {
            console.error("Submit Error:", err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] w-full max-w-lg p-8"
            >
                <div className="flex justify-between items-start mb-8">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Initiate New Drive</h2>
                    <button onClick={onClose} className="hover:bg-gray-100 p-1">
                        <X size={24} strokeWidth={3} />
                    </button>
                </div>

                <div className="space-y-6">
                    {step === 1 ? (
                        <div className="space-y-4">
                            <label className="font-mono text-xs uppercase font-black text-gray-400">Step 01 // Target_Goal</label>
                            <div className="brutal-border bg-white p-2 flex items-center shadow-brutal">
                                <span className="text-sm font-bold px-3 border-r-2 border-black mr-3 bg-brutal-yellow">GOAL</span>
                                <input
                                    type="text"
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    placeholder="e.g. PYTHON DEVELOPER"
                                    className="w-full text-lg font-bold outline-none font-mono uppercase bg-transparent"
                                    autoFocus
                                />
                            </div>
                            <button
                                onClick={() => goal.length > 3 && setStep(2)}
                                disabled={goal.length <= 3}
                                className="w-full py-3 bg-black text-white font-black uppercase text-sm hover:bg-brutal-blue transition-colors disabled:opacity-30"
                            >
                                Next Step
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <label className="font-mono text-xs uppercase font-black text-gray-400">Step 02 // Time_Frame</label>
                            <div className="brutal-border bg-white p-2 flex items-center shadow-brutal">
                                <span className="text-sm font-bold px-3 border-r-2 border-black mr-3 bg-brutal-red text-white">TIME</span>
                                <input
                                    type="text"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    placeholder="e.g. 3 MONTHS"
                                    className="w-full text-lg font-bold outline-none font-mono uppercase bg-transparent"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 bg-white border-2 border-black font-black uppercase text-sm hover:bg-gray-100 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading || deadline.length === 0}
                                    className="flex-[2] py-3 bg-brutal-green text-black font-black uppercase text-sm border-2 border-black shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin rounded-full" /> : <><ArrowRight size={18} /> Initialize</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
