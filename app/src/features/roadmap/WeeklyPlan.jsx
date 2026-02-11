import { motion, AnimatePresence } from 'framer-motion'
import { CheckSquare, ChevronDown, ExternalLink } from 'lucide-react'
import { useState } from 'react'

export function WeeklyPlan({ node, onClose }) {
    const [expandedTaskIndex, setExpandedTaskIndex] = useState(null)

    if (!node || !node.detail) return null

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />

            {/* Slide-over Panel */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25 }}
                className="relative w-full max-w-2xl h-full bg-white border-l-4 border-black shadow-[-8px_0px_0px_0px_rgba(0,0,0,0.1)] overflow-y-auto"
            >
                <div className="sticky top-0 bg-brutal-yellow border-b-4 border-black p-6 z-10 flex justify-between items-start">
                    <div>
                        <span className="font-bold font-mono text-sm uppercase tracking-wider opacity-70">
                            Action Plan
                        </span>
                        <h2 className="text-4xl font-black uppercase leading-none mt-1">
                            {node.title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors"
                    >
                        CLOSE
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    <div className="bg-gray-50 p-4 border-l-4 border-black font-mono text-sm">
                        {node.detail.description}
                    </div>

                    {/* Tasks List */}
                    {node.detail.weeks?.map((week, i) => (
                        <div key={i} className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-black text-white px-3 py-1 font-bold text-sm transform -rotate-2">
                                    TASKS
                                </div>
                                <h3 className="font-bold text-xl uppercase">{week.topic}</h3>
                            </div>

                            <div className="space-y-3 pl-4 border-l-2 border-dashed border-gray-300">
                                {week.days.map((day, j) => {
                                    // Handle both string tasks (legacy) and object tasks (new)
                                    const taskTitle = typeof day.task === 'string' ? day.task : day.task.title;
                                    const taskDetail = typeof day.task === 'string' ? null : day.task.detail;
                                    const taskLink = typeof day.task === 'string' ? null : day.task.link;
                                    const isExpanded = expandedTaskIndex === `${i}-${j}`;

                                    return (
                                        <div key={j} className="group">
                                            <div className="flex items-start gap-4 p-3 border-2 border-transparent hover:border-black transition-all bg-white cursor-pointer"
                                                onClick={() => setExpandedTaskIndex(isExpanded ? null : `${i}-${j}`)}
                                            >
                                                {/* Checkbox */}
                                                <div className="relative pt-1" onClick={(e) => e.stopPropagation()}>
                                                    <input type="checkbox" className="peer w-6 h-6 appearance-none border-3 border-black bg-brutal-yellow checked:bg-brutal-blue transition-colors" />
                                                    <CheckSquare className="absolute top-1 left-0 pointer-events-none opacity-0 peer-checked:opacity-100 text-white" size={24} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <span className="font-bold font-mono text-xs text-gray-500 block mb-1">TASK {j + 1}</span>
                                                            <p className="font-bold text-lg leading-tight peer-checked:text-brutal-blue">
                                                                {taskTitle}
                                                            </p>
                                                        </div>
                                                        <ChevronDown className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expandable Detail Panel */}
                                            <AnimatePresence>
                                                {isExpanded && taskDetail && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden ml-10 border-l-2 border-black pl-4"
                                                    >
                                                        <div className="py-4 space-y-3">
                                                            <p className="font-mono text-sm leading-relaxed bg-gray-50 p-3 border-2 border-gray-200">
                                                                {taskDetail}
                                                            </p>
                                                            {taskLink && (
                                                                <a
                                                                    href={taskLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 bg-brutal-blue text-white px-4 py-2 font-bold text-sm uppercase hover:bg-black transition-colors border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                                                                >
                                                                    Start Resource <ExternalLink size={16} />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
