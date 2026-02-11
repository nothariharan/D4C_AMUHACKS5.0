import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Clock } from 'lucide-react'

export function GoalInput({ onSubmit }) {
    const [goal, setGoal] = useState('')
    const [deadline, setDeadline] = useState('')
    const [step, setStep] = useState(1) // 1 = Goal, 2 = Deadline
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async () => {
        if (isLoading || deadline.length === 0) return
        setIsLoading(true)
        try {
            await onSubmit(goal, deadline)
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoalKeyDown = (e) => {
        if (e.key === 'Enter' && goal.length > 3) {
            setStep(2)
        }
    }

    const handleDeadlineKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit()
        }
    }

    // Typewriter effect logic
    const placeholderText = "I want to be a..."
    const [placeholder, setPlaceholder] = useState('')

    useEffect(() => {
        let i = 0
        const interval = setInterval(() => {
            setPlaceholder(placeholderText.slice(0, i))
            i++
            if (i > placeholderText.length) clearInterval(interval)
        }, 100)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="w-full max-w-2xl relative">
            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="w-full"
                    >
                        <div className="brutal-border bg-white p-2 relative z-10 flex items-center shadow-brutal transition-transform focus-within:-translate-y-1 focus-within:shadow-[8px_8px_0px_0px_#000]">
                            <span className="text-xl font-bold px-4 select-none shrink-0 border-r-3 border-black mr-4 py-2 bg-brutal-yellow">
                                GOAL
                            </span>
                            <input
                                type="text"
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                onKeyDown={handleGoalKeyDown}
                                placeholder="FULL STACK DEVELOPER..."
                                className="w-full text-2xl font-bold outline-none font-mono bg-transparent placeholder:text-gray-300 uppercase"
                                autoFocus
                            />
                            <button
                                onClick={() => goal.length > 3 && setStep(2)}
                                className={`ml-2 p-2 bg-brutal-black text-white hover:bg-brutal-blue transition-opacity ${goal.length > 3 ? 'opacity-100' : 'opacity-0'}`}
                            >
                                <ArrowRight size={24} strokeWidth={3} />
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full"
                    >
                        <div className="brutal-border bg-white p-2 relative z-10 flex items-center shadow-brutal transition-transform focus-within:-translate-y-1 focus-within:shadow-[8px_8px_0px_0px_#000]">
                            <span className="text-xl font-bold px-4 select-none shrink-0 border-r-3 border-black mr-4 py-2 bg-brutal-red text-white">
                                DEADLINE
                            </span>
                            <input
                                type="text"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                onKeyDown={handleDeadlineKeyDown}
                                placeholder="e.g. 3 MONTHS..."
                                className="w-full text-2xl font-bold outline-none font-mono bg-transparent placeholder:text-gray-300 uppercase"
                                autoFocus
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || deadline.length === 0}
                                className={`ml-2 p-2 bg-brutal-black text-white hover:bg-brutal-yellow hover:text-black transition-all ${deadline.length > 0 ? 'opacity-100' : 'opacity-0'} ${isLoading ? 'animate-pulse cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? <Clock size={24} className="animate-spin" /> : <ArrowRight size={24} strokeWidth={3} />}
                            </button>
                        </div>
                        <button
                            onClick={() => setStep(1)}
                            className="mt-4 text-sm font-bold opacity-50 hover:opacity-100 bg-white border-2 border-black px-2 py-1"
                        >
                            ← BACK
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-brutal-blue border-3 border-black z-0" />
            <div className="absolute -bottom-4 -left-4 w-full h-4 bg-gray-200 border-3 border-black z-0 -rotate-1" />
        </div>
    )
}
