import { useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { useStore } from '../../lib/store'

export function SwipeStack() {
    const { sessions, activeSessionId, answerQuestion } = useStore()
    const session = sessions[activeSessionId]

    const questions = session?.questions || []
    const currentQuestionIndex = session?.currentQuestionIndex || 0
    const currentQuestion = questions[currentQuestionIndex]

    const x = useMotionValue(0)
    const bgOpacity = useTransform(x, [-200, 0, 200], [0.5, 0, 0.5])
    const bgColor = useTransform(x, [-200, 0, 200], ["#FF4D4D", "#FFFFFF", "#FFDE00"]) // Red -> White -> Yellow

    const [direction, setDirection] = useState(0)

    const handleSwipe = (dir) => {
        setDirection(dir === 'right' ? 1 : -1)
        answerQuestion(currentQuestion.skill, dir === 'right')
    }

    // Loading State
    if (!questions || questions.length === 0) {
        return (
            <div className="w-full max-w-md h-[400px] bg-white brutal-border flex flex-col items-center justify-center gap-4 z-10">
                <div className="w-16 h-16 border-4 border-black border-t-brutal-red rounded-full animate-spin"></div>
                <h2 className="text-2xl font-black uppercase animate-pulse text-center px-4">Creating Assessment...</h2>
                <p className="font-mono text-sm text-gray-500">Analyzing "{activeSessionId ? 'your goal' : 'career path'}"</p>
            </div>
        )
    }

    // Finished State (should be handled by store/App, but safeguard)
    if (currentQuestionIndex >= questions.length || !currentQuestion) {
        return null
    }

    return (
        <>
            {/* Ambient Background Flash */}
            <motion.div
                style={{ backgroundColor: bgColor, opacity: bgOpacity }}
                className="fixed inset-0 z-0 pointer-events-none transition-colors duration-200"
            />

            <div className="w-full max-w-md h-[500px] relative flex flex-col items-center justify-center z-10">
                <div className="absolute top-0 w-full text-center mb-4">
                    <span className="bg-black text-white px-3 py-1 font-bold font-mono text-sm">
                        QUESTION {currentQuestionIndex + 1} / {questions.length}
                    </span>
                </div>

                <div className="relative w-full h-full flex items-center justify-center">
                    <AnimatePresence
                        custom={direction}
                        mode="wait"
                        onExitComplete={() => x.set(0)}
                    >
                        <Card
                            key={currentQuestion.id || currentQuestionIndex}
                            custom={direction}
                            data={currentQuestion}
                            x={x}
                            onSwipe={handleSwipe}
                        />
                    </AnimatePresence>
                </div>

                <div className="flex gap-8 mt-8 z-10">
                    <button
                        onClick={() => handleSwipe('left')}
                        className="w-16 h-16 rounded-full border-3 border-black bg-brutal-red flex items-center justify-center shadow-brutal hover:translate-y-1 hover:shadow-none transition-all active:scale-95"
                    >
                        <X size={32} strokeWidth={3} className="text-white" />
                    </button>
                    <button
                        onClick={() => handleSwipe('right')}
                        className="w-16 h-16 rounded-full border-3 border-black bg-brutal-yellow flex items-center justify-center shadow-brutal hover:translate-y-1 hover:shadow-none transition-all active:scale-95"
                    >
                        <Check size={32} strokeWidth={3} className="text-black" />
                    </button>
                </div>

                <div className="absolute bottom-[-40px] text-gray-400 font-mono text-xs">
                    [←] DON'T KNOW &nbsp;&nbsp;&nbsp; KNOW [→]
                </div>
            </div>
        </>
    )
}

const variants = {
    enter: (direction) => ({
        x: 0,
        y: 50,
        opacity: 0,
        scale: 0.9
    }),
    center: {
        x: 0,
        y: 0,
        opacity: 1,
        scale: 1,
        transition: { duration: 0.2 }
    },
    exit: (direction) => ({
        x: direction * 500,
        opacity: 0,
        scale: 0.5,
        transition: { duration: 0.2 }
    })
}

function Card({ data, x, onSwipe, custom }) {
    const rotate = useTransform(x, [-200, 200], [-25, 25])
    const cardBg = useTransform(x, [-100, 0, 100], ["#FF4D4D", "#FFFFFF", "#FFDE00"])

    const handleDragEnd = (event, info) => {
        const swipeThreshold = 50;
        const velocityThreshold = 200;

        if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
            onSwipe('right')
        } else if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
            onSwipe('left')
        }
    }

    return (
        <motion.div
            style={{ x, rotate, backgroundColor: cardBg }}
            drag="x"
            dragConstraints={{ left: -100, right: 100 }}
            dragElastic={0.05}
            dragSnapToOrigin
            onDragEnd={handleDragEnd}

            custom={custom}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"

            whileDrag={{ cursor: 'grabbing' }}
            className="absolute w-full h-[400px] border-3 border-black shadow-brutal p-6 flex flex-col justify-between cursor-grab bg-white"
        >
            <div>
                <h3 className="text-2xl font-black uppercase border-b-3 border-black pb-2 mb-4 bg-white inline-block">
                    {data.skill}
                </h3>
                <p className="font-mono text-lg leading-relaxed bg-white/50 p-2">
                    {data.question}
                </p>
            </div>

            <div className="border-t-3 border-black pt-4 mt-4">
                <p className="font-bold text-sm uppercase bg-black text-white inline-block px-2 mb-1">
                    CONTEXT
                </p>
                <p className="text-sm font-mono text-gray-700 bg-white/50 p-1">
                    {data.context}
                </p>
            </div>
        </motion.div>
    )
}
